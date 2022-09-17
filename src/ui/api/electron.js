class ElectronApi {
  constructor() {
    window.electronAPI.onMapUploadedProgress((_event, progress) => {
      if (this.onMapUploadedProgress) {
        this.onMapUploadedProgress(progress);
      }
    });
  }

  getPath(name) {
    return new Promise((resolve, reject) => {
      window.electronAPI.getPath(name);

      window.electronAPI.onPath((_event, value) => {
        resolve(value);
      });
    });
  }

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

  selectFile(options) {
    return new Promise((resolve, reject) => {
      window.electronAPI.selectFile(options);

      window.electronAPI.onFileSelected((_event, path) => {
        resolve(path);
      });
    });
  }

  selectDirectory() {
    return new Promise((resolve, reject) => {
      window.electronAPI.selectDirectory();

      window.electronAPI.onDirectorySelected((_event, path) => {
        resolve(path);
      });
    });
  }

  findMapTiles(dir) {
    return new Promise((resolve, reject) => {
      window.electronAPI.findMapTiles(dir);

      window.electronAPI.onMapTiles((_event, files) => {
        resolve(files);
      });
    });
  }

  uploadMap(deviceId, files, progress) {
    return new Promise((resolve, reject) => {
      this.onMapUploadedProgress = progress;

      window.electronAPI.uploadMap(deviceId, JSON.parse(JSON.stringify(files)));

      window.electronAPI.onMapUploaded((_event, err) => {
        this.onMapUploadedProgress = null;

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

  getBackupInfo(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.getBackupInfo(deviceId);

      window.electronAPI.onBackupInfo((_event, info) => {
        resolve(info);
      });
    });
  }

  backup(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.backup(deviceId);

      window.electronAPI.onBackup((_event, info) => {
        resolve(info);
      });
    });
  }

  downloadBackup(deviceId, outputDirectory) {
    return new Promise((resolve, reject) => {
      window.electronAPI.downloadBackup(deviceId, outputDirectory);

      window.electronAPI.onBackupDownloaded((_event, localPath) => {
        resolve(localPath);
      });
    });
  }

  uploadBackup(deviceId, localPath) {
    return new Promise((resolve, reject) => {
      window.electronAPI.uploadBackup(deviceId, localPath);

      window.electronAPI.onBackupUploaded((_event) => {
        resolve();
      });
    });
  }

  deleteBackup(deviceId) {
    return new Promise((resolve, reject) => {
      window.electronAPI.deleteBackup(deviceId);

      window.electronAPI.onBackupDeleted((_event, info) => {
        resolve(info);
      });
    });
  }
}

module.exports = ElectronApi;
