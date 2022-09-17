const AdbWrapper = require("../../src/domain/adb-wrapper.js");

describe("suite", () => {
  test("successfully executes", async () => {
    let adb = new AdbWrapper();

    let data = await adb.run(["--version"]);

    expect(data.toString()).toMatch(/Android Debug Bridge/);
  });

  test("handles failure", async () => {
    let adb = new AdbWrapper();

    let error;
    try {
      await adb.run(["--unknown-option"]);
    } catch (e) {
      error = e;
    }

    expect(error).toMatch(/unknown command/);
  });
});
