const path = require("path");

function resolve(...fragments) {
  const mode = process.env.NODE_ENV || "production";

  if (mode === "production" && process.resourcesPath) {
    fragments.unshift("app");
    fragments.unshift(process.resourcesPath);
  }

  return path.resolve(...fragments);
}

module.exports = { resolve };
