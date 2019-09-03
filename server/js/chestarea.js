"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var area_1 = require("./area");
var ChestArea = (function (_super) {
    __extends(ChestArea, _super);
    function ChestArea(id, x, y, width, height, cx, cy, items, world) {
        var _this = _super.call(this, id, x, y, width, height, world) || this;
        _this.items = items;
        _this.chestX = cx;
        _this.chestY = cy;
        return _this;
    }
    ChestArea.prototype.contains = function (entity) {
        if (entity) {
            return (entity.x >= this.x &&
                entity.y >= this.y &&
                entity.x < this.x + this.width &&
                entity.y < this.y + this.height);
        }
        else {
            return false;
        }
    };
    return ChestArea;
}(area_1["default"]));
exports["default"] = ChestArea;
