const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => ipcRenderer.invoke("dialog:openFile"),
  onFileSelected: (callback) => ipcRenderer.once("file-selected", callback),
  uploadMap: (deviceId, path) =>
    ipcRenderer.invoke("uploadMap", deviceId, path),
  onMapUploaded: (callback) => ipcRenderer.once("map-uploaded", callback),

  listDevices: () => ipcRenderer.invoke("listDevices"),
  onDeviceList: (callback) => ipcRenderer.once("device-list", callback),

  getFeatures: (deviceId) => ipcRenderer.invoke("getFeatures", deviceId),
  onFeatureList: (callback) => ipcRenderer.once("feature-list", callback),
  saveFeatures: (deviceId, features) =>
    ipcRenderer.invoke("saveFeatures", deviceId, features),
  onFeaturesSaved: (callback) => ipcRenderer.once("features-saved", callback),

  takeScreenshot: (deviceId) => ipcRenderer.invoke("takeScreenshot", deviceId),
  onScreenshot: (callback) => ipcRenderer.once("screenshot", callback),

  getApkInfo: (deviceId) => ipcRenderer.invoke("getApkInfo", deviceId),
  onApkInfo: (callback) => ipcRenderer.once("apk-info", callback),

  clearCache: (deviceId) => ipcRenderer.invoke("clearCache", deviceId),
  onCacheCleared: (callback) => ipcRenderer.once("cache-cleared", callback),

  restartApplication: (deviceId) =>
    ipcRenderer.invoke("restartApplication", deviceId),
  onApplicationRestarted: (callback) =>
    ipcRenderer.once("application-restarted", callback),

  reboot: (deviceId) => ipcRenderer.invoke("reboot", deviceId),
  onRebooted: (callback) => ipcRenderer.once("rebooted", callback),

  getWebServerInfo: (deviceId) =>
    ipcRenderer.invoke("getWebServerInfo", deviceId),
  onWebServerInfo: (callback) => ipcRenderer.once("web-server-info", callback),
  startWebServer: (deviceId) => ipcRenderer.invoke("startWebServer", deviceId),
  onWebServerStarted: (callback) =>
    ipcRenderer.once("web-server-started", callback),
  stopWebServer: (deviceId) => ipcRenderer.invoke("stopWebServer", deviceId),
  onWebServerStopped: (callback) =>
    ipcRenderer.once("web-server-stopped", callback),
});
