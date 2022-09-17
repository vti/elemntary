const path = require("path");
const { spawn } = require("child_process");
const log4js = require("log4js");

const log = log4js.getLogger("adb");

class AdbWrapper {
  constructor(options) {
    const mode = process.env.NODE_ENV || "production";

    const binary = process.platform === "win32" ? "adb.exe" : "adb";

    let pathFragments = ["contrib", "adb", process.platform, binary];

    if (mode === "production" && process.resourcesPath) {
      pathFragments.unshift("app");
      pathFragments.unshift(process.resourcesPath);
    }

    this.command = path.resolve(...pathFragments);
  }

  push(deviceId, from, to) {
    return this.run(["-s", deviceId, "push", from, to]);
  }

  run(args, options) {
    return new Promise((resolve, reject) => {
      log.info(
        "$ " + this.command + " " + args.map((v) => "'" + v + "'").join(" ")
      );

      const adb = spawn(this.command, args);

      let stdout = Buffer.from("");
      adb.stdout.on("data", (data) => {
        if (options && options.accumulateStreams)
          stdout = Buffer.concat([stdout, data]);
      });

      let stderr = "";
      adb.stderr.on("data", (data) => {
        if (options && options.accumulateStreams) stderr += data;
      });

      adb.on("error", (error) => {
        log.error(error);

        reject({ error });
      });

      adb.on("close", (code) => {
        if (code === 0) {
          log.info(stdout);

          resolve({ code, stdout, stderr });
        } else {
          log.error(stderr);

          reject({ code, stdout, stderr });
        }
      });
    });
  }
}

module.exports = AdbWrapper;
