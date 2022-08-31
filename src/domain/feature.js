class Feature {
  constructor(id, name, enabled) {
    this.id = id;
    this.name = name;
    this.enabled = enabled;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  isEnabled() {
    return this.enabled;
  }
}

module.exports = Feature;
