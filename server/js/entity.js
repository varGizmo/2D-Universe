"use strict";
exports.__esModule = true;
var message_1 = require("./message");
var utils_1 = require("./utils");
var Entity = (function () {
    function Entity(id, type, kind, x, y) {
        this.id = parseInt(id, 10);
        this.type = type;
        this.kind = kind;
        this.x = x;
        this.y = y;
    }
    Entity.prototype.destroy = function () { };
    Entity.prototype.getBaseState = function () {
        return [parseInt(this.id, 10), this.kind, this.x, this.y];
    };
    Entity.prototype.getState = function () {
        return this.getBaseState();
    };
    Entity.prototype.spawn = function () {
        return new message_1["default"].Spawn(this);
    };
    Entity.prototype.despawn = function () {
        return new message_1["default"].Despawn(this.id);
    };
    Entity.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Entity.prototype.getPositionNextTo = function (entity) {
        var pos = { x: 0, y: 0 };
        if (entity) {
            pos = { x: 0, y: 0 };
            var r = utils_1["default"].random(4);
            pos.x = entity.x;
            pos.y = entity.y;
            if (r === 0) {
                pos.y -= 1;
            }
            if (r === 1) {
                pos.y += 1;
            }
            if (r === 2) {
                pos.x -= 1;
            }
            if (r === 3) {
                pos.x += 1;
            }
        }
        return pos;
    };
    return Entity;
}());
exports["default"] = Entity;
