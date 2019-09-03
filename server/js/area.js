"use strict";
exports.__esModule = true;
var _ = require("underscore");
var utils_1 = require("./utils");
var mob_1 = require("./mob");
var Area = (function () {
    function Area(id, x, y, width, height, world) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.world = world;
        this.entities = [];
        this.hasCompletelyRespawned = true;
    }
    Area.prototype.getRandomPositionInsideArea = function () {
        var pos = { x: 0, y: 0 };
        var valid = false;
        while (!valid) {
            pos.x = this.x + utils_1["default"].random(this.width + 1);
            pos.y = this.y + utils_1["default"].random(this.height + 1);
            valid = this.world.isValidPosition(pos.x, pos.y);
        }
        return pos;
    };
    Area.prototype.removeFromArea = function (entity) {
        var i = _.indexOf(_.pluck(this.entities, "id"), entity.id);
        this.entities.splice(i, 1);
        if (this.isEmpty() && this.hasCompletelyRespawned && this.emptyCallback) {
            this.hasCompletelyRespawned = false;
            this.emptyCallback();
        }
    };
    Area.prototype.addToArea = function (entity) {
        if (entity) {
            this.entities.push(entity);
            entity.area = this;
            if (entity instanceof mob_1["default"]) {
                this.world.addMob(entity);
            }
        }
        if (this.isFull()) {
            this.hasCompletelyRespawned = true;
        }
    };
    Area.prototype.setNumberOfEntities = function (nb) {
        this.nbEntities = nb;
    };
    Area.prototype.isEmpty = function () {
        return !_.any(this.entities, function (entity) {
            return !entity.isDead;
        });
    };
    Area.prototype.isFull = function () {
        return !this.isEmpty() && this.nbEntities === _.size(this.entities);
    };
    Area.prototype.onEmpty = function (cb) {
        this.emptyCallback = cb;
    };
    return Area;
}());
exports["default"] = Area;
