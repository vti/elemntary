const Utils = require("../../src/ui/file-utils.js");

describe("suite", () => {
  test("converts bytes to human readable size", () => {
    expect(Utils.readableBytes(1024)).toEqual("1 KB");
  });
});
