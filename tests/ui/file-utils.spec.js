import {readableBytes} from "../../src/ui/file-utils.js";

describe("suite", () => {
  test("converts bytes to human readable size", () => {
    expect(readableBytes(1024)).toEqual("1 KB");
  });
});
