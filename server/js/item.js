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
var entity_1 = require("./entity");
var Item = (function (_super) {
    __extends(Item, _super);
    function Item(id, kind, x, y) {
        var _this = _super.call(this, id, "item", kind, x, y) || this;
        _this.isStatic = false;
        _this.isFromChest = false;
        return _this;
    }
    Item.prototype.setItems = function (items) {
        throw new Error("Method not implemented.");
    };
    Item.prototype.handleDespawn = function (params) {
        var _this = this;
        this.blinkTimeout = setTimeout(function () {
            params.blinkCallback();
            _this.despawnTimeout = setTimeout(params.despawnCallback, params.blinkingDuration);
        }, params.beforeBlinkDelay);
    };
    Item.prototype.destroy = function () {
        if (this.blinkTimeout) {
            clearTimeout(this.blinkTimeout);
        }
        if (this.despawnTimeout) {
            clearTimeout(this.despawnTimeout);
        }
        if (this.isStatic) {
            this.scheduleRespawn(30000);
        }
    };
    Item.prototype.scheduleRespawn = function (delay) {
        var _this = this;
        setTimeout(function () {
            if (_this.respawn_cb) {
                _this.respawn_cb();
            }
        }, delay);
    };
    Item.prototype.onRespawn = function (cb) {
        this.respawn_cb = cb;
    };
    return Item;
}(entity_1["default"]));
exports["default"] = Item;
