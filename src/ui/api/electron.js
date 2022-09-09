class ElectronApi {
  listDevices() {
    return new Promise((resolve, reject) => {
      window.electronAPI.listDevices();

      window.electronAPI.onDeviceList((_event, value) => {
        resolve(value);
      });
    });
  }

  getDevice(deviceId) {
    return this.listDevices().then((devices) => {
      let filtered = devices.filter((d) => d.id == deviceId);

      if (filtered.length == 1) {
        return filtered[0];
      }

      return null;
    });
  }

  listDeviceFeatures(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.getFeatures(deviceId);

      window.electronAPI.onFeatureList((_event, features) => {
        resolve(features);
      });
    });
  }

  saveDeviceFeatures(deviceId, features) {
    return new Promise((resolve, reject) => {
      window.electronAPI.saveFeatures(deviceId, features);

      window.electronAPI.onFeaturesSaved((_event) => {
        resolve();
      });
    });
  }

  selectFile() {
    return new Promise((resolve, reject) => {
      window.electronAPI.selectFile();

      window.electronAPI.onFileSelected((_event, path) => {
        resolve(path);
      });
    });
  }

  uploadMap(deviceId, path) {
    return new Promise((resolve, reject) => {
      window.electronAPI.uploadMap(deviceId, path);

      window.electronAPI.onMapUploaded((_event, err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  takeScreenshot(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.takeScreenshot(deviceId);

      window.electronAPI.onScreenshot((_event, image) => {
        resolve(image);
      });
    });
  }

  loadApkInfo(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.getApkInfo(deviceId);

      window.electronAPI.onApkInfo((_event, info) => {
        resolve(info);
      });
    });
  }

  clearCache(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.clearCache(deviceId);

      window.electronAPI.onCacheCleared((_event, err) => {
        resolve();
      });
    });
  }

  restartApplication(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.restartApplication(deviceId);

      window.electronAPI.onApplicationRestarted((_event, err) => {
        resolve();
      });
    });
  }

  reboot(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.reboot(deviceId);

      window.electronAPI.onRebooted((_event, err) => {
        resolve();
      });
    });
  }

  getWebServerInfo(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.getWebServerInfo(deviceId);

      window.electronAPI.onWebServerInfo((_event, info) => {
        resolve(info);
      });
    });
  }

  startWebServer(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.startWebServer(deviceId);

      window.electronAPI.onWebServerStarted((_event, info) => {
        resolve(info);
      });
    });
  }

  stopWebServer(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.stopWebServer(deviceId);

      window.electronAPI.onWebServerStopped((_event, info) => {
        resolve(info);
      });
    });
  }
}

module.exports = ElectronApi;
