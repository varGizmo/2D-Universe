"use strict";
exports.__esModule = true;
var Pos = (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    Pos.prototype.equals = function (pos) {
        return pos.x == this.x && pos.y == this.y;
    };
    return Pos;
}());
exports["default"] = Pos;
