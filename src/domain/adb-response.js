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

        // Old ELEMNT
        if (model == "ELEMNT" && /product:elemnt_v2/.test(v)) model += " V2";

        // Fix versioning
        model = model.replace(/BOLT2/, "BOLT V2");

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
}

module.exports = AdbResponse;
