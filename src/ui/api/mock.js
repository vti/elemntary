class MockApi {
  constructor(options) {
    this.delay = options.delay;

    this.data = {
      WASDASD898WQDAS1: {
        model: "ELEMNT BOLT",
        authorized: true,
        features: [
          { id: "FEATURE-1", name: "Feature 1", enabled: true },
          { id: "FEATURE-2", name: "Feature 2", enabled: false },
        ],
      },
      WASDASD898WQDAS2: {
        model: "ELEMNT BOLT2",
        authorized: true,
        features: [
          { id: "FEATURE-1", name: "Feature 1", enabled: false },
          { id: "FEATURE-2", name: "Feature 2", enabled: false },
        ],
      },
      WASDASD898WQDAS3: {
        model: "UNKNOWN",
        authorized: false,
        features: [],
      },
    };
  }

  listDevices() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let devices = Object.keys(this.data).map((k) => {
          return { id: k, ...this.data[k] };
        });
        resolve(devices);
      }, this.delay);
    });
  }

  listDeviceFeatures(deviceId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.data[deviceId].features);
      }, this.delay);
    });
  }

  saveDeviceFeatures(deviceId, features) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.data[deviceId].features.forEach((v, i) => {
          if (features[v.id]) {
            v.enabled = true;
          } else {
            v.enabled = false;
          }
        });

        resolve();
      }, this.delay);
    });
  }

  selectFile() {
    return new Promise((resolve, reject) => {
      resolve("/foo/bar.zip");
    });
  }

  uploadMap(deviceId, path) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this.delay);
    });
  }
}

module.exports = MockApi;
