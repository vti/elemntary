const { spawn } = require("child_process");
const log4js = require("log4js");

const log = log4js.getLogger("adb");

class AdbWrapper {
  constructor(options) {
    const mode = process.env.NODE_ENV || "production";

    let command =
      (mode === "production" ? process.resourcesPath + "/app/" : "") +
      `contrib/adb/${process.platform}/adb`;

    if (process.platform === "win32") {
      command += ".exe";
    }

    this.command = command;
  }

  run(args) {
    return new Promise((resolve, reject) => {
      log.info(
        "$ " + this.command + " " + args.map((v) => "'" + v + "'").join(" ")
      );

      const adb = spawn(this.command, args);

      let stdout = Buffer.from("");
      adb.stdout.on("data", (data) => {
        stdout = Buffer.concat([stdout, data]);
      });

      let stderr = "";
      adb.stderr.on("data", (data) => {
        stderr += data;
      });

      adb.on("error", (err) => {
        log.error(err);
        reject(err);
      });

      adb.on("close", (code) => {
        if (code === 0) {
          log.info(stdout);
          resolve(stdout);
        } else {
          log.error(stderr);
          reject(stderr);
        }
      });
    });
  }
}

module.exports = AdbWrapper;
