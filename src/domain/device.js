class Device {
  constructor(id, model, authorized) {
    this.id = id;
    this.model = model;
    this.authorized = authorized;
  }

  getId() {
    return this.id;
  }

  getModel() {
    return this.model;
  }

  isAuthorized() {
    return this.authorized;
  }
}

module.exports = Device;
