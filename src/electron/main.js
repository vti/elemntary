import path from "path";
import log4js from "log4js";
import unhandled from "electron-unhandled";

import {
  app,
  Menu,
  BrowserWindow,
  ipcMain,
  dialog,
} from "electron";

if (app.getGPUFeatureStatus().gpu_compositing.includes("disabled")) {
  app.disableHardwareAcceleration();
}

import contextMenu from "electron-context-menu";

import AdbWrapper from "src/domain/adb-wrapper.js";
import DeviceService from "src/domain/device-service.js";
import {resolveResources} from "./resources.js";
import {translate} from "./i18n.js";

// Stop the app launching multiple times during install on Windows
if (require("electron-squirrel-startup")) app.quit();

contextMenu({ showSaveImageAs: true });

let settings = {};
const settingsFile = path.resolve(app.getPath("userData"), "settings.json");

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

const loadI18n = () => {
  const fs = require("fs");
  const path = require("path");
  const files = fs.readdirSync(resolveResources("src", "messages"));

  var messages = {};

  files
    .filter((f) => f.match(/\.json$/))
    .forEach((f) => {
      let lang = f.replace(/\.json$/, "");

      messages[lang] = JSON.parse(
        fs.readFileSync(resolveResources("src", "messages", f))
      );
    });

  return messages;
};

const loadSettings = () => {
  const fs = require("fs");

  log.info(`Loading settings: ${settingsFile}`);

  try {
    settings = JSON.parse(fs.readFileSync(settingsFile));

    log.info(`Settings: ${JSON.stringify(settings)}`);
  } catch (e) {
    log.error(`Error loading settings: ${e}`);

    settings = {};
  }
};

const storeSettings = () => {
  const fs = require("fs");

  log.info(`Storing settings: ${settingsFile}`);

  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings));
  } catch (e) {
    log.error(`Error storing settings: ${e}`);
  }
};

const changeLocale = (win, newLocale) => {
  win.webContents.send("change-locale", newLocale);

  const menu = Menu.buildFromTemplate(buildMenuTemplate(messages, newLocale));
  Menu.setApplicationMenu(menu);

  menu.getMenuItemById("language").submenu.items.forEach((sm) => {
    if (
      sm.id === "language-" + newLocale ||
      sm.id === "language-" + newLocale.split("-")[0]
    ) {
      sm.checked = true;
    } else {
      sm.checked = false;
    }
  });
};

const setupLocale = (win) => {
  let userData = app.getPath("userData");

  log.info(`System locale: ${app.getLocale()}`);
  let selectedLocale = app.getLocale();

  if (settings.locale) {
    selectedLocale = settings.locale;
  }

  log.info(`Selected locale: ${selectedLocale}`);
  changeLocale(win, selectedLocale);
};

const buildMenuTemplate = (messages, locale) => {
  const isMac = process.platform === "darwin";

  const locales = Object.keys(messages).filter((v) => v !== "en");
  locales.sort();
  locales.unshift("en");

  const translateLabel = (locale, messageId) => {
    return translate(messages, locale, messageId);
  };

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: translateLabel(locale, "menu.file.label"),
      submenu: [
        isMac
          ? { role: "close" }
          : { label: translateLabel(locale, "menu.file.quit.label"), role: "quit" },
      ],
    },
    // { role: 'viewMenu' }
    {
      label: translateLabel(locale, "menu.view.label"),
      submenu: [
        { label: translateLabel(locale, "menu.view.reload.label"), role: "reload" },
        {
          label: translateLabel(locale, "menu.view.forceReload.label"),
          role: "forceReload",
        },
        {
          label: translateLabel(locale, "menu.view.toggleDevTools.label"),
          role: "toggleDevTools",
        },
        {
          label: translateLabel(locale, "menu.view.screenshot.label"),
          click: (e) => {
            win.webContents.send("capture-body");
          },
        },
        { type: "separator" },
        {
          label: translateLabel(locale, "menu.view.resetZoom.label"),
          role: "resetZoom",
        },
        { label: translateLabel(locale, "menu.view.zoomIn.label"), role: "zoomIn" },
        {
          label: translateLabel(locale, "menu.view.zoomOut.label"),
          role: "zoomOut",
        },
        { type: "separator" },
        {
          label: translateLabel(locale, "menu.view.togglefullscreen.label"),
          role: "togglefullscreen",
        },
      ],
    },
    {
      id: "language",
      label: translateLabel(locale, "menu.language.label"),
      submenu: locales.map((locale) => {
        return {
          id: "language-" + locale,
          type: "checkbox",
          label: translateLabel(locale, "menu.language.selection.label"),
          click: (e) => {
            changeLocale(win, locale);

            settings.locale = locale;
          },
        };
      }),
    },
    {
      label: translateLabel(locale, "menu.help.label"),
      role: "help",
      submenu: [
        {
          label: translateLabel(locale, "menu.help.about.label"),
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://github.com/vti/elemntary");
          },
        },
      ],
    },
  ];

  return template;
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

  const menu = Menu.buildFromTemplate(buildMenuTemplate(messages, "en"));
  Menu.setApplicationMenu(menu);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // When UI is ready
  win.webContents.on("dom-ready", () => {
    setupLocale(win);
  });

  return win;
};

const cleanup = () => {
  log.info("Shutting down...");

  storeSettings();

  log4js.shutdown();
};

let win;

const log = setupLogger();

loadSettings();

const messages = loadI18n();

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

  ipcMain.handle("findRoutingTiles", (_event, path) => {
    console.log(`ipc: findRoutingTiles: ${path}`);
    deviceService.findRoutingTiles(path).then((files) => {
      win.webContents.send("routing-tiles", files);
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

  ipcMain.handle("uploadRouting", (_event, deviceId, files) => {
    console.log(`ipc: uploadRouting: ${deviceId} ${path}`);
    deviceService
      .copyRouting(deviceId, files, (progress) => {
        win.webContents.send("routing-uploaded-progress", progress);
      })
      .then(() => {
        win.webContents.send("routing-uploaded");
      })
      .catch((err) => {
        win.webContents.send("routing-uploaded", err);
      });
  });

  ipcMain.handle("findThemeFiles", (_event, path) => {
    deviceService.findThemeFiles(path).then((files) => {
      win.webContents.send("theme-files", files);
    });
  });

  ipcMain.handle("uploadTheme", (_event, deviceId, files) => {
    deviceService
      .copyTheme(deviceId, files)
      .then(() => {
        win.webContents.send("theme-uploaded");
      })
      .catch((err) => {
        win.webContents.send("theme-uploaded", err);
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
      Promise.allSettled(promises).then(() => {
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
