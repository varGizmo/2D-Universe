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
var item_1 = require("./item");
var utils_1 = require("./utils");
var _ = require("underscore");
var gametypes_1 = require("../../shared/js/gametypes");
var Chest = (function (_super) {
    __extends(Chest, _super);
    function Chest(id, x, y) {
        var _this = _super.call(this, id, gametypes_1["default"].Entities.CHEST, x, y) || this;
        _this.items = [];
        return _this;
    }
    Chest.prototype.setItems = function (items) {
        this.items = items;
    };
    Chest.prototype.getRandomItem = function () {
        var nbItems = _.size(this.items);
        if (nbItems > 0) {
            return this.items[utils_1["default"].random(nbItems)];
        }
        else
            return null;
    };
    return Chest;
}(item_1["default"]));
exports["default"] = Chest;
