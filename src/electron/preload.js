const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  log: (level, msg) => ipcRenderer.invoke("log", level, msg),

  onBodyCapture: (callback) => ipcRenderer.on("capture-body", callback),

  getPath: (name) => ipcRenderer.invoke("getPath", name),
  onPath: (callback) => ipcRenderer.once("path", callback),

  selectFile: (options) => ipcRenderer.invoke("dialog:openFile", options),
  onFileSelected: (callback) => ipcRenderer.once("file-selected", callback),

  selectDirectory: () => ipcRenderer.invoke("selectDirectory"),
  onDirectorySelected: (callback) =>
    ipcRenderer.once("directory-selected", callback),

  uploadMap: (deviceId, files) =>
    ipcRenderer.invoke("uploadMap", deviceId, files),
  onMapUploaded: (callback) => ipcRenderer.once("map-uploaded", callback),
  onMapUploadedProgress: (callback) =>
    ipcRenderer.on("map-uploaded-progress", callback),
  findMapTiles: (path) => ipcRenderer.invoke("findMapTiles", path),
  onMapTiles: (callback) => ipcRenderer.once("map-tiles", callback),

  findThemeFiles: (path) => ipcRenderer.invoke("findThemeFiles", path),
  onThemeFiles: (callback) => ipcRenderer.once("theme-files", callback),
  uploadTheme: (deviceId, files) =>
    ipcRenderer.invoke("uploadTheme", deviceId, files),
  onThemeUploaded: (callback) => ipcRenderer.once("theme-uploaded", callback),

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

  getBackupInfo: (deviceId) => ipcRenderer.invoke("getBackupInfo", deviceId),
  onBackupInfo: (callback) => ipcRenderer.once("backup-info", callback),
  backup: (deviceId) => ipcRenderer.invoke("backup", deviceId),
  onBackup: (callback) => ipcRenderer.once("backup", callback),
  downloadBackup: (deviceId, outputDirectory) =>
    ipcRenderer.invoke("downloadBackup", deviceId, outputDirectory),
  onBackupDownloaded: (callback) =>
    ipcRenderer.once("backup-downloaded", callback),
  uploadBackup: (deviceId, localPath) =>
    ipcRenderer.invoke("uploadBackup", deviceId, localPath),
  onBackupUploaded: (callback) => ipcRenderer.once("backup-uploaded", callback),
  deleteBackup: (deviceId) => ipcRenderer.invoke("deleteBackup", deviceId),
  onBackupDeleted: (callback) => ipcRenderer.once("backup-deleted", callback),
});
