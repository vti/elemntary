const process = require("process");
const fs = require("fs");
const path = require("path");

const Walker = require("walker");
const extract = require("extract-zip");

const AdbWrapper = require("./adb-wrapper.js");
const AdbResponse = require("./adb-response.js");
const Feature = require("./feature.js");
const Features = require("./features.js");

const BACKUP_FILE = "elemnt_config.zip";

class DeviceService {
  constructor(options) {
    this.adb = options.adbWrapper || new AdbWrapper();
  }

  listDevices() {
    return this.adb
      .run(["devices", "-l"], { accumulateStreams: true })
      .then(({ stdout }) => {
        let devices = new AdbResponse().parseDevices(stdout.toString());

        let authorized = devices.filter((d) => d.authorized);
        let notAuthorized = devices.filter((d) => !d.authorized);

        if (authorized.length === 0) {
          return [...authorized, ...notAuthorized];
        }

        let batteryPromises = [];
        authorized.forEach((device) => {
          batteryPromises.push(this.getBatteryInfo(device.id));
        });

        return Promise.all(batteryPromises).then((data) => {
          data.forEach((batteryInfo, i) => {
            authorized[i].batteryInfo = batteryInfo;
          });

          return [...authorized, ...notAuthorized];
        });
      });
  }

  getFeatures(deviceId) {
    return this.adb
      .run(["-s", deviceId, "shell", "ls", "/sdcard/"], {
        accumulateStreams: true,
      })
      .then(({ stdout }) => {
        let files = stdout
          .toString()
          .split(/\r*\n/)
          .filter((v, i) => {
            return /^cfg_/i.test(v);
          });

        let features = [];

        Object.keys(Features).forEach((key) => {
          let enabled = false;
          if (files.includes(Features[key])) {
            enabled = true;
          }

          features.push(new Feature(Features[key], key, enabled));
        });

        return features;
      });
  }

  getBatteryInfo(deviceId) {
    return this.adb
      .run(["-s", deviceId, "shell", "dumpsys", "battery"], {
        accumulateStreams: true,
      })
      .then(({ stdout }) =>
        new AdbResponse().parseBatteryInfo(stdout.toString())
      );
  }

  getApkInfo(deviceId) {
    return this.adb
      .run(
        [
          "-s",
          deviceId,
          "shell",
          "dumpsys",
          "package",
          "com.wahoofitness.bolt",
        ],
        { accumulateStreams: true }
      )
      .then(({ stdout }) => new AdbResponse().parseApkInfo(stdout.toString()));
  }

  enableFeature(deviceId, feature) {
    return this.adb.run([
      "-s",
      deviceId,
      "shell",
      "touch",
      `/sdcard/${feature}`,
    ]);
  }

  disableFeature(deviceId, feature) {
    return this.adb.run(["-s", deviceId, "shell", "rm", `/sdcard/${feature}`]);
  }

  findMapTiles(dir) {
    return new Promise((resolve, reject) => {
      const re = new RegExp("(\\d+).(\\d+).map.lzma$");

      let files = [];
      Walker(dir)
        .on("file", (file, stat) => {
          const match = re.exec(file);

          if (match) {
            files.push({
              path: path.resolve(file),
              basename: path.basename(file),
              size: stat.size,
              x: match[1],
              y: match[2],
            });
          }
        })
        .on("end", () => {
          resolve(files);
        });
    });
  }

  findRoutingTiles(dir) {
    return new Promise((resolve, reject) => {
      const re = new RegExp("(\\d+).(\\d+).gph.lzma$");

      let files = [];
      Walker(dir)
        .on("file", (file, stat) => {
          const match = re.exec(file);

          if (match) {
            files.push({
              path: path.resolve(file),
              basename: path.basename(file),
              size: stat.size,
              x: match[1],
              y: match[2],
            });
            console.log(files); // TODO Remove
          }
        })
        .on("end", () => {
          resolve(files);
        });
    });
  }

  copyMap(deviceId, files, callback) {
    let queue = Promise.resolve();
    files.forEach((file, idx) => {
      queue = queue.then((result) => {
        if (callback)
          callback({
            totalFiles: files.length,
            uploadedFiles: idx + 1,
          });
        return this.adb.push(
          deviceId,
          file.path,
          `/sdcard/maps/tiles/8/${file.x}/${file.basename}`
        );
      });
    });

    return queue.then(() => {
      return this.clearCache(deviceId);
    });
  }

  copyRouting(deviceId, files, callback) {
    let queue = Promise.resolve();
    files.forEach((file, idx) => {
      queue = queue.then((result) => {
        if (callback)
          callback({
            totalFiles: files.length,
            uploadedFiles: idx + 1,
          });
        return this.adb.push(
          deviceId,
          file.path,
          `/sdcard/maps/routing/2/000/${file.x}/${file.basename}`
        );
      });
    });

    return queue.then(() => {
      return this.clearCache(deviceId);
    });
  }

  findThemeFiles(dir) {
    return new Promise((resolve, reject) => {
      let files = [];
      Walker(dir)
        .on("file", (file, stat) => {
          let basename = path.basename(file);
          let type = null;

          if (basename === "vtm-elemnt.xml") {
            type = "theme";
          } else if (basename === "COLORS.html") {
            type = "colors";
          } else if (/\.svg$/.test(file)) {
            type = "icon";
          }

          if (type != null) {
            files.push({
              path: path.resolve(file),
              basename: path.basename(file),
              relative: path.relative(dir, file),
              type,
            });
          }
        })
        .on("end", () => {
          resolve(files);
        });
    });
  }

  copyTheme(deviceId, files) {
    let queue = Promise.resolve();
    files.forEach((file, idx) => {
      queue = queue.then((result) => {
        if (file.type === "theme" || file.type === "colors") {
          return this.adb.push(
            deviceId,
            file.path,
            `/sdcard/maps/vtm-elemnt/${file.basename}`
          );
        } else if (file.type === "icon") {
          let relativePath = file.relative;

          if (process.platform === "win32") {
            relativePath = relativePath.replaceAll("\\", "/");
          }

          return this.adb.push(
            deviceId,
            file.path,
            `/sdcard/maps/vtm-elemnt/${relativePath}`
          );
        }
      });
    });

    return queue.then(() => {
      return this.clearCache(deviceId);
    });
  }

  clearCache(deviceId) {
    return Promise.all([
      this.adb.run([
        "-s",
        deviceId,
        "shell",
        "am",
        "broadcast",
        "-a",
        "com.wahoofitness.bolt.service.BMapManager.PURGE",
      ]),
      this.adb.run([
        "-s",
        deviceId,
        "shell",
        "am",
        "broadcast",
        "-a",
        "com.wahoofitness.bolt.service.BMapManager.RELOAD_MAP",
      ]),
    ]);
  }

  takeScreenshot(deviceId) {
    return this.adb
      .run(["-s", deviceId, "exec-out", "screencap", "-p"], {
        accumulateStreams: true,
      })
      .then(({ stdout }) => {
        return stdout.toString("base64");
      });
  }

  restartApplication(deviceId) {
    return this.adb.run([
      "-s",
      deviceId,
      "shell",
      "am",
      "force-stop",
      "com.wahoofitness.bolt",
    ]);
  }

  reboot(deviceId) {
    return this.adb.run(["-s", deviceId, "reboot"]);
  }

  getWebServerInfo(deviceId) {
    return this.adb
      .run(["-s", deviceId, "shell", "netstat", "-tpna"], {
        accumulateStreams: true,
      })
      .then(({ stdout }) => {
        let services = new AdbResponse().parseNetstat(stdout.toString());

        if (
          services.filter(
            (s) =>
              s.proto == "tcp6" && s.localPort == 8080 && s.state == "LISTEN"
          ).length
        ) {
          let netcfg = this.adb.run(["-s", deviceId, "shell", "netcfg"], {
            accumulateStreams: true,
          });
          let ifconfig = this.adb.run(["-s", deviceId, "shell", "ifconfig"], {
            accumulateStreams: true,
          });

          return Promise.any([netcfg, ifconfig])
            .then(({ stdout }) => {
              let info = { running: true };

              let interfaces = [];

              if (/MTU/.test(stdout.toString())) {
                interfaces = new AdbResponse().parseIfconfig(stdout.toString());
              } else {
                interfaces = new AdbResponse().parseNetcfg(stdout.toString());
              }

              interfaces = interfaces.filter(
                (i) => i.name == "wlan0" && i.state == "UP"
              );

              if (interfaces.length) {
                info.endpoint = "http://" + interfaces[0].address + ":8080";
              }

              return info;
            })
            .catch((e) => {});
        } else {
          return {
            running: false,
          };
        }
      });
  }

  startWebServer(deviceId) {
    return this.adb
      .run([
        "-s",
        deviceId,
        "shell",
        "am",
        "broadcast",
        "-a",
        "com.wahoofitness.support.webserver.StdWebServerManager.START",
      ])
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.getWebServerInfo(deviceId).then((info) => {
              if (info.running) {
                resolve(info);
              } else {
                setTimeout(() => {
                  this.getWebServerInfo(deviceId).then((info) => {
                    if (info.running) resolve(info);
                    else reject();
                  });
                }, 5000);
              }
            });
          }, 2000);
        });
      });
  }

  stopWebServer(deviceId) {
    return this.adb
      .run([
        "-s",
        deviceId,
        "shell",
        "am",
        "force-stop",
        "com.wahoofitness.bolt",
      ])
      .then(() => {
        return true;
      });
  }

  backup(deviceId) {
    return this.adb
      .run(["-s", deviceId, "shell", "mkdir", "-p", "/sdcard/config_backup"])
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.getBackupInfo(deviceId).then((info) => {
              if (info.available) resolve();
              else
                setTimeout(() => {
                  this.getBackupInfo(deviceId).then((info) => {
                    if (info.available) resolve();
                    else resolve();
                  });
                }, 5000);
            });
          }, 2000);
        });
      });
  }

  deleteBackup(deviceId) {
    return this.adb
      .run(["-s", deviceId, "shell", "rm", "-rf", "/sdcard/config_backup"])
      .then(() => {});
  }

  getBackupInfo(deviceId) {
    return this.adb
      .run(
        [
          "-s",
          deviceId,
          "shell",
          "ls",
          "-la",
          `/sdcard/config_backup/${BACKUP_FILE}`,
        ],
        { accumulateStreams: true }
      )
      .then(({ stdout }) => {
        if (/no such file or directory/i.test(stdout)) {
          return { available: false };
        }
        return { available: true };
      })
      .catch((e) => {
        return { available: false };
      });
  }

  downloadBackup(deviceId, outputDirectory) {
    const localPath = path.resolve(outputDirectory, BACKUP_FILE);

    return this.adb
      .run([
        "-s",
        deviceId,
        "pull",
        `/sdcard/config_backup/${BACKUP_FILE}`,
        localPath,
      ])
      .then(() => {
        return localPath;
      });
  }

  uploadBackup(deviceId, localPath) {
    return this.adb
      .run(["-s", deviceId, "shell", "mkdir", "-p", "/sdcard/config_restore"])
      .then(() => {
        return this.adb
          .run([
            "-s",
            deviceId,
            "push",
            localPath,
            `/sdcard/config_restore/${BACKUP_FILE}`,
          ])
          .then(() => {
            return true;
          });
      });
  }
}

module.exports = DeviceService;
