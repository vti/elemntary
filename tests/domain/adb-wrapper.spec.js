const AdbWrapper = require("../../src/domain/adb-wrapper.js");

describe("suite", () => {
  test("successfully executes", async () => {
    let adb = new AdbWrapper();

    let result = await adb.run(["--version"], { accumulateStreams: true });

    expect(result.code).toBe(0);
    expect(result.stdout.toString()).toMatch(/Android Debug Bridge/);
  });

  test("handles failure", async () => {
    let adb = new AdbWrapper();

    let result;
    try {
      await adb.run(["--unknown-option"], { accumulateStreams: true });
    } catch (e) {
      result = e;
    }

    expect(result.code).not.toBe(0);
    expect(result.stderr).toMatch(/unknown command/);
  });
});
