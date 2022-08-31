class Api {
  constructor(options) {
    this.data = options.data;
    this.api = options.backend;
  }

  loadDevices() {
    this.data.devices = [];
    this.data.loaders.devices = true;

    return this.api.listDevices().then((devices) => {
      this.data.devices = devices;

      if (devices.length && devices[0].authorized) {
        this.selectDevice(devices[0].id);
      }

      this.data.loaders.devices = false;

      return this.data;
    });
  }

  selectDevice(deviceId) {
    let device = this.data.devices.filter((d) => d.id == deviceId)[0];

    this.data.devices.forEach((d) => (d.selected = false));

    device.selected = true;
    this.data.device = device;

    this.loadDeviceFeatures(deviceId);
  }

  uploadMap(deviceId, path) {
    if (!deviceId) return;
    if (!path) return;

    this.data.loaders.uploadMap = true;
    this.data.errors.uploadMap = null;
    this.data.messages.uploadMap = null;

    this.api
      .uploadMap(deviceId, path)
      .then(() => {
        this.data.messages.uploadMap = "Map successfully uploaded";

        setTimeout(() => {
          this.data.messages.uploadMap = null;
        }, 10000);

        this.data.loaders.uploadMap = false;
      })
      .catch((err) => {
        this.data.errors.uploadMap = err;

        this.data.loaders.uploadMap = false;
      });
  }

  loadDeviceFeatures(deviceId) {
    if (!deviceId) return;

    this.data.loaders.hiddenFeatures = true;

    this.api.listDeviceFeatures(deviceId).then((features) => {
      this.data.device.features = features;

      this.data.loaders.hiddenFeatures = false;
    });
  }

  saveFeatures(deviceId, features) {
    if (!deviceId) return;

    this.data.loaders.saveFeatures = true;

    this.api.saveDeviceFeatures(deviceId, features).then(() => {
      this.data.loaders.saveFeatures = false;
    });
  }

  selectFile() {
    return this.api.selectFile();
  }
}

module.exports = Api;
