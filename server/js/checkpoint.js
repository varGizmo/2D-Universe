"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var Checkpoint = (function () {
    function Checkpoint(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Checkpoint.prototype.getRandomPosition = function () {
        var pos = { x: 0, y: 0 };
        pos.x = this.x + utils_1["default"].randomInt(0, this.width - 1);
        pos.y = this.y + utils_1["default"].randomInt(0, this.height - 1);
        return pos;
    };
    return Checkpoint;
}());
exports["default"] = Checkpoint;
