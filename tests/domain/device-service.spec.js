const DeviceService = require("../../src/domain/device-service.js");
const Feature = require("../../src/domain/feature.js");
const MockAdbWrapper = require("../lib/mock-adb-wrapper.js");

describe("suite", () => {
  test("extracts feature list", async () => {
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
