class MockAdbWrapper {
  constructor(options) {
    this.replies = options.replies || [];
  }

  run(command, args) {
    return new Promise((resolve, reject) => {
      let reply = this.replies.pop();

      if (reply.code == 0) {
        resolve(reply.stdout);
      } else {
        reject(reply.stderr);
      }
    });
  }
}

module.exports = MockAdbWrapper;
