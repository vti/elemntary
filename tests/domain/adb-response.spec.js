const AdbResponse = require("../../src/domain/adb-response.js");

describe("suite", () => {
  test("parses devices list", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
W4IZAMAIBASWV4MR       device usb:1-3 product:tidy_goertek2601_l model:ELEMNT_BOLT device:goertek2601_l transport_id:33
43212600473            device usb:1-2.2 product:bolt2p0 model:ELEMNT_BOLT2 device:bolt2p0 transport_id:4
S47T4P7HI7NNTWY9       device usb:1-9 product:elemnt_v2 model:ELEMNT device:goertek2601_l transport_id:4

`
    );

    expect(devices).toStrictEqual([
      { id: "W4IZAMAIBASWV4MR", model: "ELEMNT BOLT", authorized: true },
      { id: "43212600473", model: "ELEMNT BOLT V2", authorized: true },
      { id: "S47T4P7HI7NNTWY9", model: "ELEMNT V2", authorized: true },
    ]);
  });

  test("parses unauthorized devices", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
43212600473            unauthorized usb:1-2.2 transport_id:39

  `
    );

    expect(devices).toStrictEqual([
      { id: "43212600473", model: "UNKNOWN", authorized: false },
    ]);
  });

  test("orders authorized above unauthorized", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
43212600473            unauthorized usb:1-2.2 transport_id:39
W4IZAMAIBASWV4MR       device usb:1-3 product:tidy_goertek2601_l model:ELEMNT_BOLT device:goertek2601_l transport_id:33

`
    );

    expect(devices).toStrictEqual([
      { id: "W4IZAMAIBASWV4MR", model: "ELEMNT BOLT", authorized: true },
      { id: "43212600473", model: "UNKNOWN", authorized: false },
    ]);
  });

  test("ignores non wahoo devices", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
ZY3266V977             device usb:1-2.2 product:lineage_ocean model:moto_g_7__power device:ocean transport_id:42

`
    );

    expect(devices).toStrictEqual([]);
  });

  test("parses battery info", async () => {
    let batteryInfo = new AdbResponse().parseBatteryInfo(
      `
Current Battery Service state:
  AC powered: false
  USB powered: true
  Wireless powered: false
  status: 5
  health: 2
  present: true
  level: 100
  scale: 100
  voltage: 4269
  temperature: 360
  technology: Li-ion
`
    );

    expect(batteryInfo).toEqual({
      "ac-powered": "false",
      health: "2",
      level: "100",
      present: "true",
      scale: "100",
      status: "5",
      technology: "li-ion",
      temperature: "360",
      "usb-powered": "true",
      voltage: "4269",
      "wireless-powered": "false",
    });
  });
});
