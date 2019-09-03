"use strict";
exports.__esModule = true;
var _ = require("underscore");
var fs = require("fs");
var file_1 = require("../../shared/js/file");
var pos_1 = require("./pos");
var utils_1 = require("./utils");
var checkpoint_1 = require("./checkpoint");
var area_1 = require("./area");
var Map = (function () {
    function Map(filepath) {
        var _this = this;
        this.isLoaded = false;
        file_1["default"].exists(filepath, function (exists) {
            if (!exists) {
                console.error(filepath + " doesn't exist.");
                return;
            }
            fs.readFile(filepath, function (err, file) {
                var json = JSON.parse(file.toString());
                _this.initMap(json);
            });
        });
    }
    Map.prototype.initMap = function (thismap) {
        this.width = thismap.width;
        this.height = thismap.height;
        this.collisions = thismap.collisions;
        this.mobAreas = thismap.roamingAreas;
        this.chestAreas = thismap.chestAreas;
        this.staticChests = thismap.staticChests;
        this.staticEntities = thismap.staticEntities;
        this.isLoaded = true;
        this.zoneWidth = 28;
        this.zoneHeight = 12;
        this.groupWidth = Math.floor(this.width / this.zoneWidth);
        this.groupHeight = Math.floor(this.height / this.zoneHeight);
        this.initConnectedGroups(thismap.doors);
        this.initCheckpoints(thismap.checkpoints);
        this.initPVPAreas(thismap.pvpAreas);
        if (this.readyFunc) {
            this.readyFunc();
        }
    };
    Map.prototype.ready = function (f) {
        this.readyFunc = f;
    };
    Map.prototype.tileIndexToGridPosition = function (tileNum) {
        var x = 0;
        var y = 0;
        var getX = function (num, w) {
            if (num === 0) {
                return 0;
            }
            return num % w === 0 ? w - 1 : (num % w) - 1;
        };
        tileNum -= 1;
        x = getX(tileNum + 1, this.width);
        y = Math.floor(tileNum / this.width);
        return { x: x, y: y };
    };
    Map.prototype.GridPositionToTileIndex = function (x, y) {
        return y * this.width + x + 1;
    };
    Map.prototype.generateCollisionGrid = function () {
        this.grid = [];
        if (this.isLoaded) {
            var tileIndex = 0;
            for (var j = void 0, i = 0; i < this.height; i++) {
                this.grid[i] = [];
                for (j = 0; j < this.width; j++) {
                    if (_.include(this.collisions, tileIndex)) {
                        this.grid[i][j] = 1;
                    }
                    else {
                        this.grid[i][j] = 0;
                    }
                    tileIndex += 1;
                }
            }
            console.debug("Collision grid generated.");
        }
    };
    Map.prototype.isOutOfBounds = function (x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    };
    Map.prototype.isColliding = function (x, y) {
        if (this.isOutOfBounds(x, y)) {
            return false;
        }
        return this.grid[y][x] === 1;
    };
    Map.prototype.isPVP = function (x, y) {
        var area = null;
        area = _.detect(this.pvpAreas, function (area) {
            return area.contains(x, y);
        });
        if (area) {
            return true;
        }
        else {
            return false;
        }
    };
    Map.prototype.GroupIdToGroupPosition = function (id) {
        var posArray = id.split("-");
        return new pos_1["default"](parseInt(posArray[0], 10), parseInt(posArray[1], 10));
    };
    Map.prototype.forEachGroup = function (cb) {
        var width = this.groupWidth;
        var height = this.groupHeight;
        for (var x = 0; x < width; x += 1) {
            for (var y = 0; y < height; y += 1) {
                cb(x + "-" + y);
            }
        }
    };
    Map.prototype.getGroupIdFromPosition = function (x, y) {
        var w = this.zoneWidth;
        var h = this.zoneHeight;
        var gx = Math.floor((x - 1) / w);
        var gy = Math.floor((y - 1) / h);
        return gx + "-" + gy;
    };
    Map.prototype.getAdjacentGroupPositions = function (id) {
        var _this = this;
        var position = this.GroupIdToGroupPosition(id);
        var x = position.x;
        var y = position.y;
        var list = [
            new pos_1["default"](x - 1, y - 1),
            new pos_1["default"](x, y - 1),
            new pos_1["default"](x + 1, y - 1),
            new pos_1["default"](x - 1, y),
            new pos_1["default"](x, y),
            new pos_1["default"](x + 1, y),
            new pos_1["default"](x - 1, y + 1),
            new pos_1["default"](x, y + 1),
            new pos_1["default"](x + 1, y + 1)
        ];
        _.each(this.connectedGroups[id], function (position) {
            if (!_.any(list, function (groupPos) {
                return groupPos.equals(position);
            })) {
                list.push(position);
            }
        });
        return _.reject(list, function (pos) {
            return (pos.x < 0 ||
                pos.y < 0 ||
                pos.x >= _this.groupWidth ||
                pos.y >= _this.groupHeight);
        });
    };
    Map.prototype.forEachAdjacentGroup = function (groupId, cb) {
        if (groupId) {
            _.each(this.getAdjacentGroupPositions(groupId), function (pos) {
                cb(pos.x + "-" + pos.y);
            });
        }
    };
    Map.prototype.initConnectedGroups = function (doors) {
        var _this = this;
        this.connectedGroups = {};
        _.each(doors, function (door) {
            var groupId = _this.getGroupIdFromPosition(door.x, door.y);
            var connectedGroupId = _this.getGroupIdFromPosition(door.tx, door.ty);
            var connectedPosition = _this.GroupIdToGroupPosition(connectedGroupId);
            if (groupId in _this.connectedGroups) {
                _this.connectedGroups[groupId].push(connectedPosition);
            }
            else {
                _this.connectedGroups[groupId] = [connectedPosition];
            }
        });
    };
    Map.prototype.initCheckpoints = function (cpList) {
        var _this = this;
        this.checkpoints = {};
        this.startingAreas = [];
        _.each(cpList, function (cp) {
            var checkpoint = new checkpoint_1["default"](cp.id, cp.x, cp.y, cp.w, cp.h);
            _this.checkpoints[checkpoint.id] = checkpoint;
            if (cp.s === 1) {
                _this.startingAreas.push(checkpoint);
            }
        });
    };
    Map.prototype.getCheckpoint = function (id) {
        return this.checkpoints[id];
    };
    Map.prototype.getRandomStartingPosition = function () {
        var nbAreas = _.size(this.startingAreas), i = utils_1["default"].randomInt(0, nbAreas - 1), area = this.startingAreas[i];
        return area.getRandomPosition();
    };
    Map.prototype.initPVPAreas = function (pvpList) {
        var _this = this;
        this.pvpAreas = [];
        _.each(pvpList, function (pvp) {
            var pvpArea = new area_1["default"](pvp.id, pvp.x, pvp.y, pvp.w, pvp.h, null);
            _this.pvpAreas.push(pvpArea);
        });
    };
    return Map;
}());
exports["default"] = Map;
