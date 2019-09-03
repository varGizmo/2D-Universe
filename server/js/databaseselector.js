"use strict";
exports.__esModule = true;
var path = require("path");
function default_1(config) {
    return require(path.resolve(__dirname, "db_providers", config.database));
}
exports["default"] = default_1;
