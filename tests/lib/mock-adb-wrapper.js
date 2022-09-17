class MockAdbWrapper {
  constructor(options) {
    this.replies = options.replies || [];
  }

  run(command, args) {
    return new Promise((resolve, reject) => {
      let reply = this.replies.pop();

      if (reply.code === 0) {
        resolve({ code: 0, stdout: reply.stdout });
      } else {
        reject({ code: 1, stdout: reply.stdout, stderr: reply.stderr });
      }
    });
  }
}

module.exports = MockAdbWrapper;
