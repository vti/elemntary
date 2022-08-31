const MockApi = require("../../src/ui/api/mock.js");
const Api = require("../../src/ui/api.js");

describe("suite", () => {
  test("loads devices", async () => {
    let data = {
      loaders: {},
      errors: {},
      messages: {},
      device: null,
      devices: [],
    };

    let api = new Api({
      data: data,
      backend: new MockApi({ delay: 10 }),
    });

    await api.loadDevices();

    expect(data.devices).toHaveLength(3);
  });
});
