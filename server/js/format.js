"use strict";
exports.__esModule = true;
var _ = require("underscore");
var gametypes_1 = require("../../shared/js/gametypes");
var FormatChecker = (function () {
    function FormatChecker() {
        this.formats = [];
        (this.formats[gametypes_1["default"].Messages.CREATE] = ["s", "s", "s"]),
            (this.formats[gametypes_1["default"].Messages.LOGIN] = ["s", "s"]),
            (this.formats[gametypes_1["default"].Messages.MOVE] = ["n", "n"]),
            (this.formats[gametypes_1["default"].Messages.LOOTMOVE] = ["n", "n", "n"]),
            (this.formats[gametypes_1["default"].Messages.AGGRO] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.ATTACK] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.HIT] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.HURT] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.CHAT] = ["s"]),
            (this.formats[gametypes_1["default"].Messages.LOOT] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.TELEPORT] = ["n", "n"]),
            (this.formats[gametypes_1["default"].Messages.ZONE] = []),
            (this.formats[gametypes_1["default"].Messages.OPEN] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.CHECK] = ["n"]),
            (this.formats[gametypes_1["default"].Messages.ACHIEVEMENT] = ["n", "s"]);
    }
    FormatChecker.prototype.check = function (msg) {
        var message = msg.slice(0), type = message[0], format = this.formats[type];
        message.shift();
        if (format) {
            if (message.length !== format.length) {
                return false;
            }
            for (var i = 0, n = message.length; i < n; i += 1) {
                if (format[i] === "n" && !_.isNumber(message[i])) {
                    return false;
                }
                if (format[i] === "s" && !_.isString(message[i])) {
                    return false;
                }
            }
            return true;
        }
        else if (type === gametypes_1["default"].Messages.WHO) {
            return (message.length > 0 &&
                _.all(message, function (param) {
                    return _.isNumber(param);
                }));
        }
        else if (type === gametypes_1["default"].Messages.LOGIN) {
            return (_.isString(message[0]) &&
                _.isNumber(message[1]) &&
                _.isNumber(message[2]) &&
                (message.length == 3 ||
                    (_.isNumber(message[3]) &&
                        _.isString(message[4]) &&
                        message.length == 5)));
        }
        else if (type === gametypes_1["default"].Messages.GUILD) {
            if (message[0] === gametypes_1["default"].Messages.GUILDACTION.CREATE) {
                return message.length === 2 && _.isString(message[1]);
            }
            else if (message[0] === gametypes_1["default"].Messages.GUILDACTION.INVITE) {
                return message.length === 2 && _.isString(message[1]);
            }
            else if (message[0] === gametypes_1["default"].Messages.GUILDACTION.JOIN) {
                return (message.length === 3 &&
                    _.isNumber(message[1]) &&
                    _.isBoolean(message[2]));
            }
            else if (message[0] === gametypes_1["default"].Messages.GUILDACTION.LEAVE) {
                return message.length === 1;
            }
            else if (message[0] === gametypes_1["default"].Messages.GUILDACTION.TALK) {
                return message.length === 2 && _.isString(message[1]);
            }
            else {
                throw new Error("Unknown message type: " + type);
            }
        }
        else {
            throw new Error("Unknown message type: " + type);
        }
    };
    return FormatChecker;
}());
exports["default"] = FormatChecker;
