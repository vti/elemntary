const path = require("path");

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const contextMenu = require("electron-context-menu");

const AdbWrapper = require("../domain/adb-wrapper.js");
const DeviceService = require("../domain/device-service.js");

// Stop the app launching multiple times during install on Windows
if (require("electron-squirrel-startup")) return app.quit();

contextMenu({ showSaveImageAs: true });

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("./src/ui/index.html");

  return win;
};

let win;

app.whenReady().then(() => {
  let deviceService = new DeviceService(new AdbWrapper());

  ipcMain.handle("dialog:openFile", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog();

    win.webContents.send("file-selected", canceled ? null : filePaths[0]);

    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle("uploadMap", (_event, deviceId, path) => {
    console.log(`ipc: uploadMap: ${deviceId} ${path}`);
    deviceService
      .copyMap(deviceId, path)
      .then(() => {
        win.webContents.send("map-uploaded");
      })
      .catch((err) => {
        win.webContents.send("map-uploaded", err);
      });
  });

  ipcMain.handle("listDevices", () => {
    deviceService.listDevices().then((devices) => {
      win.webContents.send("device-list", devices);
    });
  });

  ipcMain.handle("getFeatures", (_event, deviceId) => {
    deviceService.getFeatures(deviceId).then((features) => {
      win.webContents.send("feature-list", features);
    });
  });

  ipcMain.handle("saveFeatures", (_event, deviceId, features) => {
    let promises = [];

    Object.keys(features).forEach((v, i) => {
      if (features[v]) {
        promises.push(deviceService.enableFeature(deviceId, v));
      } else {
        promises.push(deviceService.disableFeature(deviceId, v));
      }
    });

    if (promises.length) {
      Promise.all(promises).then(() => {
        win.webContents.send("features-saved");
      });
    }
  });

  ipcMain.handle("takeScreenshot", (_event, deviceId) => {
    deviceService.takeScreenshot(deviceId).then((image) => {
      win.webContents.send("screenshot", image);
    });
  });

  win = createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
