"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
exports["default"] = {
    dmg: function (weaponLevel, armorLevel) {
        var dealt = weaponLevel * utils_1["default"].randomInt(5, 10);
        var absorbed = armorLevel * utils_1["default"].randomInt(1, 3);
        var dmg = dealt - absorbed;
        console.log("abs: " + absorbed + " dealt: " + dealt + " dmg: " + (dealt - absorbed));
        if (dmg <= 0) {
            return utils_1["default"].randomInt(0, 3);
        }
        else {
            return dmg;
        }
    },
    hp: function (armorLevel) {
        var hp = 80 + (armorLevel - 1) * 30;
        return hp;
    }
};
