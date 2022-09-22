const path = require("path");
const log4js = require("log4js");
const unhandled = require("electron-unhandled");

const {
  app,
  Menu,
  MenuItem,
  BrowserWindow,
  ipcMain,
  dialog,
} = require("electron");

if (app.getGPUFeatureStatus().gpu_compositing.includes("disabled")) {
  app.disableHardwareAcceleration();
}

const contextMenu = require("electron-context-menu");

const AdbWrapper = require("../domain/adb-wrapper.js");
const DeviceService = require("../domain/device-service.js");

// Stop the app launching multiple times during install on Windows
if (require("electron-squirrel-startup")) return app.quit();

contextMenu({ showSaveImageAs: true });

const setupLogger = () => {
  const logPath = path.resolve(app.getPath("logs"), "elemntary.log");
  console.log(`Logging to ${logPath}`);

  let appenders = ["file"];

  if (process.env.NODE_ENV !== "production") appenders.push("console");

  log4js.configure({
    appenders: {
      console: { type: "stderr" },
      file: {
        type: "file",
        filename: logPath,
        maxLogSize: 10 * 1024 * 1024, // 10Mb
        backups: 3,
        compress: true,
      },
    },
    categories: {
      default: { appenders: appenders, level: "debug" },
    },
  });

  const log = log4js.getLogger("main");
  log.level = "debug";

  log.info(
    `Starting ${app.getName()}-${app.getVersion()} ${process.platform}-${
      process.arch
    }-${process.version} (${process.env.NODE_ENV})...`
  );

  return log;
};

const createWindow = () => {
  log.debug("Creating window...");

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const menu = Menu.getApplicationMenu();
  const viewMenu = menu.items.filter((m) => m.role === "viewmenu")[0];
  viewMenu.submenu.insert(
    3,
    new MenuItem({
      label: "Take screenshot",
      click: (e) => {
        win.webContents.send("capture-body");
      },
    })
  );

  if (process.env.LOCAL_SERVER) {
    win.loadURL(process.env.LOCAL_SERVER);
  } else {
    win.loadFile("./dist/index.html");
  }

  return win;
};

const cleanup = () => {
  log.info("Shutting down...");

  log4js.shutdown();
};

let win;

const log = setupLogger();

unhandled({ logger: (e) => log.error(e) });

app.whenReady().then(() => {
  let deviceService = new DeviceService(new AdbWrapper());

  log.debug("Registering ipc handlers...");

  ipcMain.handle("log", (_event, level, msg) => {
    log4js.getLogger("ui").log(level, msg);
  });

  ipcMain.on("body-captured", (_event, image) => {
    const fs = require("fs");
    fs.writeFile(
      "screenshots/screenshot.png",
      Buffer.from(image, "base64"),
      (e) => {}
    );
  });

  ipcMain.handle("getPath", (_event, name) => {
    let localDir;

    if (name === "elemntaryData") {
      localDir = path.resolve(app.getPath("appData"), "elemntary");
    } else {
      localDir = app.getPath(name);
    }

    win.webContents.send("path", localDir);
  });

  ipcMain.handle("dialog:openFile", async (_event, options) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(options);

    win.webContents.send("file-selected", canceled ? null : filePaths[0]);

    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle("selectDirectory", () => {
    dialog
      .showOpenDialog({
        properties: ["openDirectory"],
      })
      .then((data) => {
        if (!data.canceled && data.filePaths.length > 0) {
          win.webContents.send("directory-selected", data.filePaths[0]);
        } else {
          win.webContents.send("directory-selected", null);
        }
      });
  });

  ipcMain.handle("findMapTiles", (_event, path) => {
    console.log(`ipc: findTiles: ${path}`);
    deviceService.findMapTiles(path).then((files) => {
      win.webContents.send("map-tiles", files);
    });
  });

  ipcMain.handle("uploadMap", (_event, deviceId, files) => {
    //console.log(`ipc: uploadMap: ${deviceId} ${path}`);
    deviceService
      .copyMap(deviceId, files, (progress) => {
        win.webContents.send("map-uploaded-progress", progress);
      })
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

  ipcMain.handle("getApkInfo", (_event, deviceId) => {
    deviceService.getApkInfo(deviceId).then((info) => {
      win.webContents.send("apk-info", info);
    });
  });

  ipcMain.handle("clearCache", (_event, deviceId) => {
    deviceService.clearCache(deviceId).then(() => {
      win.webContents.send("cache-cleared");
    });
  });

  ipcMain.handle("restartApplication", (_event, deviceId) => {
    deviceService.restartApplication(deviceId).then(() => {
      win.webContents.send("application-restarted");
    });
  });

  ipcMain.handle("reboot", (_event, deviceId) => {
    deviceService.reboot(deviceId).then(() => {
      win.webContents.send("rebooted");
    });
  });

  ipcMain.handle("getWebServerInfo", (_event, deviceId) => {
    deviceService.getWebServerInfo(deviceId).then((info) => {
      win.webContents.send("web-server-info", info);
    });
  });

  ipcMain.handle("startWebServer", (_event, deviceId) => {
    deviceService.startWebServer(deviceId).then((info) => {
      win.webContents.send("web-server-started", info);
    });
  });

  ipcMain.handle("stopWebServer", (_event, deviceId) => {
    deviceService.stopWebServer(deviceId).then((info) => {
      win.webContents.send("web-server-stopped", info);
    });
  });

  ipcMain.handle("getBackupInfo", (_event, deviceId) => {
    deviceService.getBackupInfo(deviceId).then((info) => {
      win.webContents.send("backup-info", info);
    });
  });

  ipcMain.handle("backup", (_event, deviceId) => {
    deviceService.backup(deviceId).then((info) => {
      win.webContents.send("backup", info);
    });
  });

  ipcMain.handle("deleteBackup", (_event, deviceId) => {
    deviceService.deleteBackup(deviceId).then(() => {
      win.webContents.send("backup-deleted");
    });
  });

  ipcMain.handle("downloadBackup", (_event, deviceId, outputDirectory) => {
    deviceService
      .downloadBackup(deviceId, outputDirectory)
      .then((localPath) => {
        win.webContents.send("backup-downloaded", localPath);
      });
  });

  ipcMain.handle("uploadBackup", (_event, deviceId, localPath) => {
    deviceService.uploadBackup(deviceId, localPath).then(() => {
      win.webContents.send("backup-uploaded");
    });
  });

  log.debug("IPC handlers registered");

  win = createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("quit", () => {
    cleanup();
  });

  log.info("Ready");
});

app.on("window-all-closed", () => {
  cleanup();

  if (process.platform !== "darwin") app.quit();
});
