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
var character_1 = require("./character");
var chestarea_1 = require("./chestarea");
var message_1 = require("./message");
var mobarea_1 = require("./mobarea");
var properties_1 = require("./properties");
var utils_1 = require("./utils");
var Mob = (function (_super) {
    __extends(Mob, _super);
    function Mob(id, kind, x, y) {
        var _this = _super.call(this, id, "mob", kind, x, y) || this;
        _this.updateHitPoints();
        _this.spawningX = x;
        _this.spawningY = y;
        _this.armorLevel = properties_1["default"].getArmorLevel(_this.kind);
        _this.weaponLevel = properties_1["default"].getWeaponLevel(_this.kind);
        _this.hatelist = [];
        _this.respawnTimeout = null;
        _this.returnTimeout = null;
        _this.isDead = false;
        _this.hateCount = 0;
        _this.tankerlist = [];
        return _this;
    }
    Mob.prototype.destroy = function () {
        this.isDead = true;
        this.hatelist = [];
        this.tankerlist = [];
        this.clearTarget();
        this.updateHitPoints();
        this.resetPosition();
        this.handleRespawn();
    };
    Mob.prototype.receiveDamage = function (points, playerId) {
        this.hitPoints -= points;
    };
    Mob.prototype.hates = function (playerId) {
        return _.any(this.hatelist, function (obj) {
            return obj.id === playerId;
        });
    };
    Mob.prototype.increaseHateFor = function (playerId, points) {
        if (this.hates(playerId)) {
            _.detect(this.hatelist, function (obj) {
                return obj.id === playerId;
            }).hate += points;
        }
        else {
            this.hatelist.push({ id: playerId, hate: points });
        }
        if (this.returnTimeout) {
            clearTimeout(this.returnTimeout);
            this.returnTimeout = null;
        }
    };
    Mob.prototype.addTanker = function (playerId) {
        var i = 0;
        for (i = 0; i < this.tankerlist.length; i++) {
            if (this.tankerlist[i].id === playerId) {
                this.tankerlist[i].points++;
                break;
            }
        }
        if (i >= this.tankerlist.length) {
            this.tankerlist.push({ id: playerId, points: 1 });
        }
    };
    Mob.prototype.getMainTankerId = function () {
        var i = 0;
        var mainTanker = null;
        for (i = 0; i < this.tankerlist.length; i++) {
            if (mainTanker === null) {
                mainTanker = this.tankerlist[i];
                continue;
            }
            if (mainTanker.points < this.tankerlist[i].points) {
                mainTanker = this.tankerlist[i];
            }
        }
        if (mainTanker) {
            return mainTanker.id;
        }
        else {
            return null;
        }
    };
    Mob.prototype.getHatedPlayerId = function (hateRank) {
        var i, playerId, sorted = _.sortBy(this.hatelist, function (obj) {
            return obj.hate;
        }), size = _.size(this.hatelist);
        if (hateRank && hateRank <= size) {
            i = size - hateRank;
        }
        else {
            if (size === 1) {
                i = size - 1;
            }
            else {
                this.hateCount++;
                if (this.hateCount > size * 1.3) {
                    this.hateCount = 0;
                    i = size - 1 - utils_1["default"].random(size - 1);
                    console.info("CHANGE TARGET: " + i);
                }
                else {
                    return 0;
                }
            }
        }
        if (sorted && sorted[i]) {
            playerId = sorted[i].id;
        }
        return playerId;
    };
    Mob.prototype.forgetPlayer = function (playerId, duration) {
        this.hatelist = _.reject(this.hatelist, function (obj) {
            return obj.id === playerId;
        });
        this.tankerlist = _.reject(this.tankerlist, function (obj) {
            return obj.id === playerId;
        });
        if (this.hatelist.length === 0) {
            this.returnToSpawningPosition(duration);
        }
    };
    Mob.prototype.forgetEveryone = function () {
        this.hatelist = [];
        this.tankerlist = [];
        this.returnToSpawningPosition(1);
    };
    Mob.prototype.drop = function (item) {
        if (item) {
            return new message_1["default"].Drop(this, item);
        }
    };
    Mob.prototype.handleRespawn = function () {
        var _this = this;
        var delay = 30000;
        if (this.area && this.area instanceof mobarea_1["default"]) {
            this.area.respawnMob(this, delay);
        }
        else {
            if (this.area && this.area instanceof chestarea_1["default"]) {
                this.area.removeFromArea(this);
            }
            setTimeout(function () {
                if (_this.respawnCallback) {
                    _this.respawnCallback();
                }
            }, delay);
        }
    };
    Mob.prototype.onRespawn = function (cb) {
        this.respawnCallback = cb;
    };
    Mob.prototype.resetPosition = function () {
        this.setPosition(this.spawningX, this.spawningY);
    };
    Mob.prototype.returnToSpawningPosition = function (waitDuration) {
        var _this = this;
        var delay = waitDuration || 4000;
        this.clearTarget();
        this.returnTimeout = setTimeout(function () {
            _this.resetPosition();
            _this.move(_this.x, _this.y);
        }, delay);
    };
    Mob.prototype.onMove = function (cb) {
        this.moveCallback = cb;
    };
    Mob.prototype.move = function (x, y) {
        this.setPosition(x, y);
        if (this.moveCallback) {
            this.moveCallback(this);
        }
    };
    Mob.prototype.updateHitPoints = function () {
        this.resetHitPoints(properties_1["default"].getHitPoints(this.kind));
    };
    Mob.prototype.distanceToSpawningPoint = function (x, y) {
        return utils_1["default"].distanceTo(x, y, this.spawningX, this.spawningY);
    };
    return Mob;
}(character_1["default"]));
exports["default"] = Mob;
