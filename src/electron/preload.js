const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => ipcRenderer.invoke("dialog:openFile"),
  onFileSelected: (callback) => ipcRenderer.on("file-selected", callback),
  uploadMap: (deviceId, path) =>
    ipcRenderer.invoke("uploadMap", deviceId, path),
  onMapUploaded: (callback) => ipcRenderer.on("map-uploaded", callback),

  listDevices: () => ipcRenderer.invoke("listDevices"),
  onDeviceList: (callback) => ipcRenderer.on("device-list", callback),

  getFeatures: (deviceId) => ipcRenderer.invoke("getFeatures", deviceId),
  onFeatureList: (callback) => ipcRenderer.on("feature-list", callback),
  saveFeatures: (deviceId, features) =>
    ipcRenderer.invoke("saveFeatures", deviceId, features),
  onFeaturesSaved: (callback) => ipcRenderer.on("features-saved", callback),

  takeScreenshot: (deviceId) => ipcRenderer.invoke("takeScreenshot", deviceId),
  onScreenshot: (callback) => ipcRenderer.on("screenshot", callback),

  getApkInfo: (deviceId) => ipcRenderer.invoke("getApkInfo", deviceId),
  onApkInfo: (callback) => ipcRenderer.on("apk-info", callback),
});
