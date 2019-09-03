export default class ProductionConfig {
  config: any;
  production: any;
  constructor(config: any) {
    this.config = config;
    try {
      this.production = require("../production_hosts/" +
        config.production +
        ".js");
    } catch (err) {
      this.production = null;
    }
  }

  inProduction() {
    if (this.production !== null) {
      return this.production.isActive();
    }
    return false;
  }

  getProductionSettings() {
    if (this.inProduction()) {
      return this.production;
    }
  }
}
