const log4js = require("log4js");

const log = log4js.getLogger("adb");

class AdbResponse {
  parseDevices(data) {
    let devices = data
      .split(/\r?\n/)
      .filter((v, i) => {
        return /authorized/.test(v) || (/device/.test(v) && /ELEMNT/.test(v));
      })
      .map((v) => {
        let id = "";

        v.replace(/(^[^\s]+)\s+/, function ($0, $1) {
          id = $1;
        });

        let model = "UNKNOWN";

        if (/unauthorized/.test(v)) {
          return {
            id: id,
            model: model,
            authorized: false,
          };
        }

        v.replace(/model:(ELEMNT.*?)\s+/, function ($0, $1) {
          model = $1.replace(/_/, " ");
        });

        log.info(model);
        // Old ELEMNT
        if (model === "ELEMNT" && /product:elemnt_v2/.test(v)) model += " V2";

        // Fix versioning
        model = model.replace(/BOLT2/, "BOLT V2");
        model = model.replace(/ROAM1_1/, "ROAM V1");


        return {
          id: id,
          model: model,
          authorized: true,
        };
      });

    let authorized = devices.filter((d) => d.authorized);
    let notAuthorized = devices.filter((d) => !d.authorized);

    return [...authorized, ...notAuthorized];
  }

  parseBatteryInfo(data) {
    let lines = data.split(/\r?\n/).filter((v) => /^\s+/.test(v));

    let info = {};

    lines.forEach((line) => {
      let values = line.split(/:/);
      let key = values[0].trim().toLowerCase().replace(/\s+/, "-");
      let value = values[1].trim().toLowerCase();

      info[key] = value;
    });

    return info;
  }

  parseApkInfo(data) {
    let lines = data.split(/\r*\n/);

    let info = {};

    lines.forEach((line) => {
      if (/^\s+versionCode=/.test(line)) {
        line.replace(/versionCode=(\d+)/, function ($0, $1) {
          info.versionCode = $1;
        });
      } else if (/^\s+versionName=/.test(line)) {
        line.replace(/versionName=([^\s]+)/, function ($0, $1) {
          info.versionName = $1;
        });
      } else if (/^\s+lastUpdateTime=/.test(line)) {
        line.replace(/lastUpdateTime=(.*)$/, function ($0, $1) {
          info.lastUpdated = $1;
        });
      }
    });

    return info;
  }

  parseHardwareInfo(data) {
       let parts = data.split(":");
       log.info(data);
       log.info(parts[1].trim())
       let info = {};
       info.model = parts[1].trim()
       return info;
  }

  parseNetstat(data) {
    let lines = data.split(/\r?\n/);

    let services = [];

    lines.forEach((line) => {
      if (/^tcp/.test(line)) {
        let parts = line.split(/\s+/);

        let localAddress = this.splitAddressAndPort(parts[3]);
        let foreignAddress = this.splitAddressAndPort(parts[4]);

        let info = {
          proto: parts[0],
          localAddress: localAddress[0],
          localPort: localAddress[1],
          foreignAddress: foreignAddress[0],
          foreignPort: foreignAddress[1],
          state: parts[5],
        };

        if (parts[6]) {
          let pidAndProgram = parts[6].split(/\//);
          info.pid = Number(pidAndProgram[0]);
          info.program = pidAndProgram[1];
        }

        services.push(info);
      }
    });

    return services;
  }

  parseNetcfg(data) {
    let lines = data.split(/\r?\n/);

    let interfaces = [];

    lines.forEach((line) => {
      let parts = line.split(/\s+/);

      if (parts.length < 5) return;

      let address = parts[2].replace(/\/\d+$/, "");

      let info = {
        name: parts[0],
        state: parts[1],
        address: address,
      };

      interfaces.push(info);
    });

    return interfaces;
  }

  parseIfconfig(data) {
    let blocks = data.trim().split(/\r?\n\r?\n/);

    let interfaces = [];

    blocks.forEach((b) => {
      let lines = b.split(/\r?\n/);
      let firstLineParts = lines[0].split(/\s+/);

      let info = {
        name: firstLineParts[0],
      };

      b.replace(/^\s+inet addr:(.*?)\s+/m, function ($0, $1) {
        info.address = $1;
      });

      b.replace(/^\s+([A-Z]+).*?MTU.*$/m, function ($0, $1) {
        info.state = $1;
      });

      interfaces.push(info);
    });

    return interfaces;
  }

  splitAddressAndPort(address) {
    let port;

    address = address.replace(/:([^:]+)$/, function ($0, $1) {
      if ($1 == "*") {
        port = null;
      } else {
        port = Number($1);
      }

      return "";
    });

    return [address, port];
  }
}

module.exports = AdbResponse;
