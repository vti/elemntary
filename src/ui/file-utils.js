function readableBytes(bytes) {
  let i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + " " + sizes[i];
}

module.exports = { readableBytes };
