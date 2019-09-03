"use strict";
let __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
let requirejs_1 = __importDefault(require("requirejs"));
let globals = {};
requirejs_1["default"].config({ nodeRequire: require, baseUrl: "js/" });
requirejs_1["default"](["lib/class", "../../shared/js/gametypes"], function (_Class, _Types) {
    globals.Class = _Class;
    globals.Types = _Types;
    global.window = globals;
});
