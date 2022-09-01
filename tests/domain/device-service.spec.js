const DeviceService = require("../../src/domain/device-service.js");
const Device = require("../../src/domain/device.js");
const Feature = require("../../src/domain/feature.js");
const MockAdbWrapper = require("../lib/mock-adb-wrapper.js");

describe("suite", () => {
  test("parses devices list", async () => {
    let service = new DeviceService({
      adbWrapper: new MockAdbWrapper({
        replies: [
          {
            code: 0,
            stdout: Buffer.from(`List of devices attached
W4IZAMAIBASWV4MR       device usb:1-3 product:tidy_goertek2601_l model:ELEMNT_BOLT device:goertek2601_l transport_id:33
43212600473            device usb:1-2.2 product:bolt2p0 model:ELEMNT_BOLT2 device:bolt2p0 transport_id:4
S47T4P7HI7NNTWY9       device usb:1-9 product:elemnt_v2 model:ELEMNT device:goertek2601_l transport_id:4

`),
          },
        ],
      }),
    });

    let devices = await service.listDevices();

    expect(devices).toStrictEqual([
      new Device("W4IZAMAIBASWV4MR", "ELEMNT BOLT", true),
      new Device("43212600473", "ELEMNT BOLT V2", true),
      new Device("S47T4P7HI7NNTWY9", "ELEMNT V2", true),
    ]);
  });

  test("parses unauthorized devices", async () => {
    let service = new DeviceService({
      adbWrapper: new MockAdbWrapper({
        replies: [
          {
            code: 0,
            stdout: Buffer.from(`List of devices attached
43212600473            unauthorized usb:1-2.2 transport_id:39

`),
          },
        ],
      }),
    });

    let devices = await service.listDevices();

    expect(devices).toStrictEqual([
      new Device("43212600473", "UNKNOWN", false),
    ]);
  });

  test("ignores non wahoo devices", async () => {
    let service = new DeviceService({
      adbWrapper: new MockAdbWrapper({
        replies: [
          {
            code: 0,
            stdout: Buffer.from(`List of devices attached
ZY3266V977             device usb:1-2.2 product:lineage_ocean model:moto_g_7__power device:ocean transport_id:42

`),
          },
        ],
      }),
    });

    let devices = await service.listDevices();

    expect(devices).toStrictEqual([]);
  });

  test("parses feature list", async () => {
    let service = new DeviceService({
      adbWrapper: new MockAdbWrapper({
        replies: [
          {
            code: 0,
            stdout: Buffer.from(`.crash
cfg_MapPanZoom
exports
factory
logs
maps
mtklog
plans
routes
system_update
system_update_elemnt
`),
          },
        ],
      }),
    });

    let features = await service.getFeatures();

    expect(features).toContainEqual(
      new Feature("cfg_MapPanZoom", "MAP_PAN_ZOOM", true)
    );
    expect(features).toContainEqual(
      new Feature("cfg_BHomeActivity_VtmMaps", "VTM_RENDERING", false)
    );
  });
});
