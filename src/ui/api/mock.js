class MockApi {
  constructor(options) {
    this.delay = options.delay;

    this.data = {
      WASDASD898WQDAS1: {
        model: "ELEMNT BOLT",
        authorized: true,
        selected: false,
        features: [
          { id: "FEATURE-1", name: "Feature 1", enabled: true },
          { id: "FEATURE-2", name: "Feature 2", enabled: false },
        ],
      },
      WASDASD898WQDAS2: {
        model: "ELEMNT BOLT2",
        authorized: true,
        selected: false,
        features: [
          { id: "FEATURE-1", name: "Feature 1", enabled: false },
          { id: "FEATURE-2", name: "Feature 2", enabled: false },
        ],
      },
      WASDASD898WQDAS3: {
        model: "UNKNOWN",
        authorized: false,
        selected: false,
        features: [],
      },
    };
  }

  getPath(name) {
    return new Promise((resolve, reject) => {
      resolve("/Downloads");
    });
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

  getDevice(deviceId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: deviceId, ...this.data[deviceId] });
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

  selectDirectory() {
    return new Promise((resolve, reject) => {
      resolve("/foo/bar");
    });
  }

  uploadMap(deviceId, path) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this.delay);
    });
  }

  takeScreenshot(deviceId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(
          "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"
        );
      }, this.delay);
    });
  }

  loadHardwareInfo(deviceid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          cpu: "ARMv7 Processor rev 5 (v7l)",
          model: "Qualcomm Technologies, Inc APQ8009",
        });
      }, this.delay);
    });
  }

  loadApkInfo(deviceid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          lastUpdated: "2022-08-31 05:51:21",
          versionCode: "15152",
          versionName: "1.60.0.70",
        });
      }, this.delay);
    });
  }
  clearCache(deviceid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this.delay);
    });
  }

  restartApplication(deviceid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this.delay);
    });
  }

  reboot(deviceid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this.delay);
    });
  }

  getWebServerInfo(deviceId) {
    return new Promise((resolve, reject) => {
      resolve({
        running: false,
      });
    });
  }

  getBackupInfo(deviceId) {
    return new Promise((resolve, reject) => {
      resolve({ available: true });
    });
  }

  backup(deviceId) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  downloadBackup(deviceId, outputDirectory) {
    return new Promise((resolve, reject) => {
      resolve("/path/to/file.zip");
    });
  }

  uploadBackup(deviceId, localPath) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  deleteBackup(deviceId) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

module.exports = MockApi;
