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
var _ = require("underscore");
var area_1 = require("./area");
var mob_1 = require("./mob");
var gametypes_1 = require("../../shared/js/gametypes");
var utils_1 = require("./utils");
var MobArea = (function (_super) {
    __extends(MobArea, _super);
    function MobArea(id, nb, kind, x, y, width, height, world) {
        var _this = _super.call(this, id, x, y, width, height, world) || this;
        _this.nb = nb;
        _this.kind = kind;
        _this.respawns = [];
        _this.setNumberOfEntities(_this.nb);
        _this.initRoaming();
        return _this;
    }
    MobArea.prototype.spawnMobs = function () {
        for (var i = 0; i < this.nb; i += 1) {
            this.addToArea(this.createMobInsideArea());
        }
    };
    MobArea.prototype.createMobInsideArea = function () {
        var k = gametypes_1["default"].getKindFromString(this.kind);
        var pos = this.getRandomPositionInsideArea();
        var mob = new mob_1["default"]("1" + this.id + "" + k + "" + this.entities.length, k, pos.x, pos.y);
        mob.onMove(this.world.onMobMoveCallback.bind(this.world));
        return mob;
    };
    MobArea.prototype.respawnMob = function (mob, delay) {
        var _this = this;
        this.removeFromArea(mob);
        setTimeout(function () {
            var pos = _this.getRandomPositionInsideArea();
            mob.x = pos.x;
            mob.y = pos.y;
            mob.isDead = false;
            _this.addToArea(mob);
            _this.world.addMob(mob);
        }, delay);
    };
    MobArea.prototype.initRoaming = function (mob) {
        var _this = this;
        setInterval(function () {
            _.each(_this.entities, function (mob) {
                var canRoam = utils_1["default"].random(20) === 1;
                var pos;
                if (canRoam) {
                    if (!mob.hasTarget() && !mob.isDead) {
                        pos = _this.getRandomPositionInsideArea();
                        mob.move(pos.x, pos.y);
                    }
                }
            });
        }, 500);
    };
    MobArea.prototype.createReward = function () {
        var pos = this.getRandomPositionInsideArea();
        return { x: pos.x, y: pos.y, kind: gametypes_1["default"].Entities.CHEST };
    };
    return MobArea;
}(area_1["default"]));
exports["default"] = MobArea;
