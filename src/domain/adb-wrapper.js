const { spawn } = require("child_process");

class AdbWrapper {
  constructor(options) {}

  run(args) {
    return new Promise((resolve, reject) => {
      const mode = process.env.NODE_ENV || "production";

      let command =
        (mode === "production" ? process.resourcesPath + "/app/" : "") +
        `contrib/adb/${process.platform}/adb`;

      if (process.platform == "win32") {
        command += ".exe";
      }

      console.log(
        "$ " + command + " " + args.map((v) => "'" + v + "'").join(" ")
      );

      const adb = spawn(command, args);

      let stdout = Buffer.from("");
      adb.stdout.on("data", (data) => {
        stdout = Buffer.concat([stdout, data]);
      });

      let stderr = "";
      adb.stderr.on("data", (data) => {
        stderr += data;
      });

      adb.on("error", (err) => {
        console.log(err);
        reject(err);
      });

      adb.on("close", (code) => {
        if (code == 0) {
          console.log(stdout);
          resolve(stdout);
        } else {
          console.log(stderr);
          reject(stderr);
        }
      });
    });
  }
}

module.exports = AdbWrapper;
