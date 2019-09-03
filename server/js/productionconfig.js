"use strict";
exports.__esModule = true;
var ProductionConfig = (function () {
    function ProductionConfig(config) {
        this.config = config;
        try {
            this.production = require("../production_hosts/" +
                config.production +
                ".js");
        }
        catch (err) {
            this.production = null;
        }
    }
    ProductionConfig.prototype.inProduction = function () {
        if (this.production !== null) {
            return this.production.isActive();
        }
        return false;
    };
    ProductionConfig.prototype.getProductionSettings = function () {
        if (this.inProduction()) {
            return this.production;
        }
    };
    return ProductionConfig;
}());
exports["default"] = ProductionConfig;
