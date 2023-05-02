const I18n = require("../../src/electron/i18n.js");

const messages = {
  en: {
    greeting: "Hello",
    notPresent: "Not present",
    menu: {
      file: {
        edit: "Edit",
        quit: "Quit",
      },
    },
  },
  de: {
    greeting: "Hallo",
    menu: {
      file: {
        quit: "Beenden",
      },
    },
  },
};

describe("suite", () => {
  test("translates", () => {
    expect(I18n.translate(messages, "en", "greeting")).toEqual("Hello");
    expect(I18n.translate(messages, "de", "greeting")).toEqual("Hallo");
  });

  test("translates compound", () => {
    expect(I18n.translate(messages, "en-US", "greeting")).toEqual("Hello");
    expect(I18n.translate(messages, "de-DE", "greeting")).toEqual("Hallo");
  });

  test("deeply nested", () => {
    expect(I18n.translate(messages, "en", "menu.file.quit")).toEqual("Quit");
    expect(I18n.translate(messages, "de", "menu.file.quit")).toEqual("Beenden");
  });

  test("deeply nested not existing", () => {
    expect(I18n.translate(messages, "en", "menu.bar.baz")).toEqual(
      "menu.bar.baz"
    );
  });

  test("falls back when not present", () => {
    expect(I18n.translate(messages, "en", "notPresent")).toEqual("Not present");
    expect(I18n.translate(messages, "de", "notPresent")).toEqual("Not present");

    expect(I18n.translate(messages, "en", "menu.file.edit")).toEqual("Edit");
    expect(I18n.translate(messages, "de", "menu.file.edit")).toEqual("Edit");
  });

  test("falls back when unknown locale", () => {
    expect(I18n.translate(messages, "xx", "greeting")).toEqual("Hello");
  });

  test("handles empty values", () => {
    expect(I18n.translate(messages, "en", "does.not.exist")).toEqual(
      "does.not.exist"
    );
    expect(I18n.translate(messages, "de", "does.not.exist")).toEqual(
      "does.not.exist"
    );
  });
});
