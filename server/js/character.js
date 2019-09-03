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
var message_1 = require("./message");
var utils_1 = require("./utils");
var Character = (function (_super) {
    __extends(Character, _super);
    function Character(id, type, kind, x, y) {
        var _this = _super.call(this, id, type, kind, x, y) || this;
        _this.orientation = utils_1["default"].randomOrientation();
        _this.attackers = {};
        _this.target = null;
        return _this;
    }
    Character.prototype.getState = function () {
        var basestate = this.getBaseState(), state = [];
        state.push(this.orientation);
        if (this.target) {
            state.push(this.target);
        }
        return basestate.concat(state);
    };
    Character.prototype.resetHitPoints = function (maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
        this.hitPoints = this.maxHitPoints;
    };
    Character.prototype.regenHealthBy = function (value) {
        var hp = this.hitPoints, max = this.maxHitPoints;
        if (hp < max) {
            if (hp + value <= max) {
                this.hitPoints += value;
            }
            else {
                this.hitPoints = max;
            }
        }
    };
    Character.prototype.hasFullHealth = function () {
        return this.hitPoints === this.maxHitPoints;
    };
    Character.prototype.setTarget = function (entity) {
        this.target = entity.id;
    };
    Character.prototype.clearTarget = function () {
        this.target = null;
    };
    Character.prototype.hasTarget = function () {
        return this.target !== null;
    };
    Character.prototype.attack = function () {
        return new message_1["default"].Attack(this.id, this.target);
    };
    Character.prototype.health = function () {
        return new message_1["default"].Health(this.hitPoints, false);
    };
    Character.prototype.regen = function () {
        return new message_1["default"].Health(this.hitPoints, true);
    };
    Character.prototype.addAttacker = function (entity) {
        if (entity) {
            this.attackers[entity.id] = entity;
        }
    };
    Character.prototype.removeAttacker = function (entity) {
        if (entity && entity.id in this.attackers) {
            delete this.attackers[entity.id];
            console.debug(this.id + " REMOVED ATTACKER " + entity.id);
        }
    };
    Character.prototype.forEachAttacker = function (cb) {
        for (var id in this.attackers) {
            cb(this.attackers[id]);
        }
    };
    return Character;
}(entity_1["default"]));
exports["default"] = Character;
