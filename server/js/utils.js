"use strict";
exports.__esModule = true;
var sanitizer = require("sanitizer");
var gametypes_1 = require("../../shared/js/gametypes");
exports["default"] = {
    sanitizer: sanitizer,
    sanitize: function (string) {
        return sanitizer.escape(sanitizer.sanitize(string));
    },
    random: function (range) {
        return Math.floor(Math.random() * range);
    },
    randomRange: function (min, max) {
        return min + Math.random() * (max - min);
    },
    randomInt: function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    },
    clamp: function (min, max, value) {
        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }
        else {
            return value;
        }
    },
    randomOrientation: function () {
        var o, r = this.random(4);
        if (r === 0) {
            o = gametypes_1["default"].Orientations.LEFT;
        }
        if (r === 1) {
            o = gametypes_1["default"].Orientations.RIGHT;
        }
        if (r === 2) {
            o = gametypes_1["default"].Orientations.UP;
        }
        if (r === 3) {
            o = gametypes_1["default"].Orientations.DOWN;
        }
        return o;
    },
    Mixin: function (target, source) {
        if (source) {
            for (var key = void 0, keys = Object.keys(source), l = keys.length; l--;) {
                key = keys[l];
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    },
    distanceTo: function (x, y, x2, y2) {
        var distX = Math.abs(x - x2), distY = Math.abs(y - y2);
        return distX > distY ? distX : distY;
    },
    NaN2Zero: function (num) {
        if (isNaN(num * 1)) {
            return 0;
        }
        else {
            return num * 1;
        }
    },
    trueFalse: function (bool) {
        return bool === "true" ? true : false;
    }
};
