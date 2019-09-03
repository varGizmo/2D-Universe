"use strict";
exports.__esModule = true;
var utils_1 = require("../utils");
var message_1 = require("../message");
var redis = require("redis");
var bcrypt = require("bcrypt");
var gametypes_1 = require("../../../shared/js/gametypes");
var DatabaseHandler = (function () {
    function DatabaseHandler(config) {
        var options = {
            socket_nodelay: true
        };
        this.client = redis.createClient(config.redis_port, config.redis_host, options);
        this.client.auth(config.redis_password || "");
    }
    DatabaseHandler.prototype.loadPlayer = function (player) {
        var _this = this;
        var userKey = "u:" + player.name;
        var curTime = new Date().getTime();
        this.client.smembers("usr", function (err, replies) {
            for (var index = 0; index < replies.length; index++) {
                if (replies[index].toString() === player.name) {
                    _this.client
                        .multi()
                        .hget(userKey, "pw")
                        .hget(userKey, "armor")
                        .hget(userKey, "weapon")
                        .hget(userKey, "exp")
                        .hget("b:" + player.connection.connection.remoteAddress, "time")
                        .hget("b:" + player.connection.connection.remoteAddress, "banUseTime")
                        .hget("b:" + player.connection.connection.remoteAddress, "loginTime")
                        .hget(userKey, "avatar")
                        .zrange("adrank", -1, -1)
                        .get("nextNewArmor")
                        .hget(userKey, "inventory0")
                        .hget(userKey, "inventory0:number")
                        .hget(userKey, "inventory1")
                        .hget(userKey, "inventory1:number")
                        .hget(userKey, "achievement1:found")
                        .hget(userKey, "achievement1:progress")
                        .hget(userKey, "achievement2:found")
                        .hget(userKey, "achievement2:progress")
                        .hget(userKey, "achievement3:found")
                        .hget(userKey, "achievement3:progress")
                        .hget(userKey, "achievement4:found")
                        .hget(userKey, "achievement4:progress")
                        .hget(userKey, "achievement5:found")
                        .hget(userKey, "achievement5:progress")
                        .hget(userKey, "achievement6:found")
                        .hget(userKey, "achievement6:progress")
                        .smembers("adminname")
                        .zscore("adrank", player.name)
                        .hget(userKey, "weaponAvatar")
                        .hget(userKey, "x")
                        .hget(userKey, "y")
                        .hget(userKey, "achievement7:found")
                        .hget(userKey, "achievement7:progress")
                        .hget(userKey, "achievement8:found")
                        .hget(userKey, "achievement8:progress")
                        .hget("cb:" + player.connection.connection.remoteAddress, "etime")
                        .exec(function (err, replies) {
                        if (err)
                            throw err;
                        var pw = replies[0];
                        var armor = replies[1];
                        var weapon = replies[2];
                        var exp = utils_1["default"].NaN2Zero(replies[3]);
                        var bannedTime = utils_1["default"].NaN2Zero(replies[4]);
                        var banUseTime = utils_1["default"].NaN2Zero(replies[5]);
                        var lastLoginTime = utils_1["default"].NaN2Zero(replies[6]);
                        var avatar = replies[7];
                        var pubTopName = replies[8];
                        var nextNewArmor = replies[9];
                        var inventory = [replies[10], replies[12]];
                        var inventoryNumber = [
                            utils_1["default"].NaN2Zero(replies[11]),
                            utils_1["default"].NaN2Zero(replies[13])
                        ];
                        var achievementFound = [
                            utils_1["default"].trueFalse(replies[14]),
                            utils_1["default"].trueFalse(replies[16]),
                            utils_1["default"].trueFalse(replies[18]),
                            utils_1["default"].trueFalse(replies[20]),
                            utils_1["default"].trueFalse(replies[22]),
                            utils_1["default"].trueFalse(replies[24]),
                            utils_1["default"].trueFalse(replies[31]),
                            utils_1["default"].trueFalse(replies[33])
                        ];
                        var achievementProgress = [
                            utils_1["default"].NaN2Zero(replies[15]),
                            utils_1["default"].NaN2Zero(replies[17]),
                            utils_1["default"].NaN2Zero(replies[19]),
                            utils_1["default"].NaN2Zero(replies[21]),
                            utils_1["default"].NaN2Zero(replies[23]),
                            utils_1["default"].NaN2Zero(replies[25]),
                            utils_1["default"].NaN2Zero(replies[32]),
                            utils_1["default"].NaN2Zero(replies[34])
                        ];
                        var adminnames = replies[26];
                        var pubPoint = utils_1["default"].NaN2Zero(replies[27]);
                        var weaponAvatar = replies[28] ? replies[28] : weapon;
                        var x = utils_1["default"].NaN2Zero(replies[29]);
                        var y = utils_1["default"].NaN2Zero(replies[30]);
                        var chatBanEndTime = utils_1["default"].NaN2Zero(replies[35]);
                        bcrypt.compare(player.pw, pw, function (err, res) {
                            if (!res) {
                                player.connection.sendUTF8("invalidlogin");
                                player.connection.close("Wrong Password: " + player.name);
                                return;
                            }
                            var d = new Date();
                            var lastLoginTimeDate = new Date(lastLoginTime);
                            if (lastLoginTimeDate.getDate() !== d.getDate() &&
                                pubPoint > 0) {
                                var targetInventoryNumber = -1;
                                if (inventory[0] === "burger") {
                                    targetInventoryNumber = 0;
                                }
                                else if (inventory[1] === "burger") {
                                    targetInventoryNumber = 1;
                                }
                                else if (inventory[0] === null) {
                                    targetInventoryNumber = 0;
                                }
                                else if (inventory[1] === null) {
                                    targetInventoryNumber = 1;
                                }
                                if (targetInventoryNumber >= 0) {
                                    if (pubPoint > 100) {
                                        pubPoint = 100;
                                    }
                                    inventory[targetInventoryNumber] = "burger";
                                    inventoryNumber[targetInventoryNumber] += pubPoint * 10;
                                    _this.setInventory(player.name, gametypes_1["default"].getKindFromString("burger"), targetInventoryNumber, inventoryNumber[targetInventoryNumber]);
                                    _this.client.zrem("adrank", player.name);
                                }
                            }
                            d.setDate(d.getDate() - d.getDay());
                            d.setHours(0, 0, 0);
                            if (lastLoginTime < d.getTime()) {
                                console.info(player.name + "ban is initialized.");
                                bannedTime = 0;
                                _this.client.hset("b:" + player.connection.connection.remoteAddress, "time", bannedTime.toString());
                            }
                            _this.client.hset("b:" + player.connection.connection.remoteAddress, "loginTime", curTime.toString());
                            if (player.name === pubTopName.toString()) {
                                avatar = nextNewArmor;
                            }
                            var admin = null;
                            var i = 0;
                            for (i = 0; i < adminnames.length; i++) {
                                if (adminnames[i] === player.name) {
                                    admin = 1;
                                    console.info("Admin " + player.name + "login");
                                }
                            }
                            console.info("Player name: " + player.name);
                            console.info("Armor: " + armor);
                            console.info("Weapon: " + weapon);
                            console.info("Experience: " + exp);
                            console.info("Banned Time: " + new Date(bannedTime).toString());
                            console.info("Ban Use Time: " + new Date(banUseTime).toString());
                            console.info("Last Login Time: " + lastLoginTimeDate.toString());
                            console.info("Chatting Ban End Time: " +
                                new Date(chatBanEndTime).toString());
                            player.sendWelcome(armor, weapon, avatar, weaponAvatar, exp, admin, bannedTime, banUseTime, inventory, inventoryNumber, achievementFound, achievementProgress, x, y, chatBanEndTime);
                        });
                    });
                    return;
                }
            }
            player.connection.sendUTF8("invalidlogin");
            player.connection.close("User does not exist: " + player.name);
            return;
        });
    };
    DatabaseHandler.prototype.createPlayer = function (player) {
        var _this = this;
        var userKey = "u:" + player.name;
        var curTime = new Date().getTime();
        this.client.sismember("usr", player.name, function (err, reply) {
            if (err)
                throw err;
            if (reply === 1) {
                player.connection.sendUTF8("userexists");
                player.connection.close("Username not available: " + player.name);
                return;
            }
            else {
                _this.client
                    .multi()
                    .sadd("usr", player.name)
                    .hset(userKey, "pw", player.pw)
                    .hset(userKey, "email", player.email)
                    .hset(userKey, "armor", "clotharmor")
                    .hset(userKey, "avatar", "clotharmor")
                    .hset(userKey, "weapon", "sword1")
                    .hset(userKey, "exp", "0")
                    .hset("b:" + player.connection.connection.remoteAddress, "loginTime", curTime.toString())
                    .exec(function (err, replies) {
                    if (err)
                        throw err;
                    console.info("New User: " + player.name);
                    player.sendWelcome("clotharmor", "sword1", "clotharmor", "sword1", 0, null, 0, 0, [null, null], [0, 0], [false, false, false, false, false, false], [0, 0, 0, 0, 0, 0], player.x, player.y, 0);
                });
            }
        });
    };
    DatabaseHandler.prototype.checkBan = function (player) {
        var _this = this;
        this.client.smembers("ipban", function (err, replies) {
            for (var index = 0; index < replies.length; index++) {
                if (replies[index].toString() ===
                    player.connection.connection.remoteAddress) {
                    _this.client
                        .multi()
                        .hget("b:" + player.connection.connection.remoteAddress, "rtime")
                        .hget("b:" + player.connection.connection.remoteAddress, "time")
                        .exec(function (err, replies) {
                        var curTime = new Date();
                        var banEndTime = new Date(replies[0] * 1);
                        console.info("curTime: " + curTime.toString());
                        console.info("banEndTime: " + banEndTime.toString());
                        if (banEndTime.getTime() > curTime.getTime()) {
                            player.connection.sendUTF8("ban");
                            player.connection.close("IP Banned player: " +
                                player.name +
                                " " +
                                player.connection.connection.remoteAddress);
                        }
                    });
                    return;
                }
            }
        });
    };
    DatabaseHandler.prototype.banPlayer = function (adminPlayer, banPlayer, days) {
        var _this = this;
        this.client.smembers("adminname", function (err, replies) {
            for (var index = 0; index < replies.length; index++) {
                if (replies[index].toString() === adminPlayer.name) {
                    var curTime = new Date().getTime();
                    _this.client.sadd("ipban", banPlayer.connection.connection.remoteAddress);
                    adminPlayer.server.pushBroadcast(new message_1["default"].Chat(banPlayer, "/1 " +
                        adminPlayer.name +
                        "-- 밴 ->" +
                        banPlayer.name +
                        " " +
                        days +
                        "일"));
                    setTimeout(function () {
                        banPlayer.connection.close("Added IP Banned player: " +
                            banPlayer.name +
                            " " +
                            banPlayer.connection.connection.remoteAddress);
                    }, 30000);
                    _this.client.hset("b:" + banPlayer.connection.connection.remoteAddress, "rtime", (curTime + days * 24 * 60 * 60 * 1000).toString());
                    console.info(adminPlayer.name +
                        "-- BAN ->" +
                        banPlayer.name +
                        " to " +
                        new Date(curTime + days * 24 * 60 * 60 * 1000).toString());
                    return;
                }
            }
        });
    };
    DatabaseHandler.prototype.chatBan = function (adminPlayer, targetPlayer) {
        var _this = this;
        this.client.smembers("adminname", function (err, replies) {
            for (var index = 0; index < replies.length; index++) {
                if (replies[index].toString() === adminPlayer.name) {
                    var curTime = new Date().getTime();
                    adminPlayer.server.pushBroadcast(new message_1["default"].Chat(targetPlayer, "/1 " +
                        adminPlayer.name +
                        "-- 채금 ->" +
                        targetPlayer.name +
                        " 10분"));
                    targetPlayer.chatBanEndTime = curTime + 10 * 60 * 1000;
                    _this.client.hset("cb:" + targetPlayer.connection.connection.remoteAddress, "etime", targetPlayer.chatBanEndTime.toString());
                    console.info(adminPlayer.name +
                        "-- Chatting BAN ->" +
                        targetPlayer.name +
                        " to " +
                        new Date(targetPlayer.chatBanEndTime).toString());
                    return;
                }
            }
        });
    };
    DatabaseHandler.prototype.newBanPlayer = function (adminPlayer, banPlayer) {
        var _this = this;
        console.debug("1");
        if (adminPlayer.experience > 100000) {
            console.debug("2");
            this.client.hget("b:" + adminPlayer.connection.connection.remoteAddress, "banUseTime", function (err, reply) {
                console.debug("3");
                var curTime = new Date();
                console.debug("curTime: " + curTime.getTime());
                console.debug("bannable Time: " + reply * 1 + 1000 * 60 * 60 * 24);
                if (curTime.getTime() > reply * 1 + 1000 * 60 * 60 * 24) {
                    console.debug("4");
                    banPlayer.bannedTime++;
                    var banMsg = "" +
                        adminPlayer.name +
                        "-- 밴 ->" +
                        banPlayer.name +
                        " " +
                        banPlayer.bannedTime +
                        "번째 " +
                        Math.pow(2, banPlayer.bannedTime) / 2 +
                        "분";
                    _this.client.sadd("ipban", banPlayer.connection.connection.remoteAddress);
                    _this.client.hset("b:" + banPlayer.connection.connection.remoteAddress, "rtime", (curTime.getTime() +
                        Math.pow(2, banPlayer.bannedTime) * 500 * 60).toString());
                    _this.client.hset("b:" + banPlayer.connection.connection.remoteAddress, "time", banPlayer.bannedTime.toString());
                    _this.client.hset("b:" + adminPlayer.connection.connection.remoteAddress, "banUseTime", curTime.getTime().toString());
                    setTimeout(function () {
                        banPlayer.connection.close("Added IP Banned player: " +
                            banPlayer.name +
                            " " +
                            banPlayer.connection.connection.remoteAddress);
                    }, 30000);
                    adminPlayer.server.pushBroadcast(new message_1["default"].Chat(banPlayer, "/1 " + banMsg));
                    console.info(banMsg);
                }
                return;
            });
        }
    };
    DatabaseHandler.prototype.banTerm = function (time) {
        return Math.pow(2, time) * 500 * 60;
    };
    DatabaseHandler.prototype.equipArmor = function (name, armor) {
        console.info("Set Armor: " + name + " " + armor);
        this.client.hset("u:" + name, "armor", armor);
    };
    DatabaseHandler.prototype.equipAvatar = function (name, armor) {
        console.info("Set Avatar: " + name + " " + armor);
        this.client.hset("u:" + name, "avatar", armor);
    };
    DatabaseHandler.prototype.equipWeapon = function (name, weapon) {
        console.info("Set Weapon: " + name + " " + weapon);
        this.client.hset("u:" + name, "weapon", weapon);
    };
    DatabaseHandler.prototype.setExp = function (name, exp) {
        console.info("Set Exp: " + name + " " + exp);
        this.client.hset("u:" + name, "exp", exp);
    };
    DatabaseHandler.prototype.setInventory = function (name, itemKind, inventoryNumber, itemNumber) {
        if (itemKind) {
            this.client.hset("u:" + name, "inventory" + inventoryNumber, gametypes_1["default"].getKindAsString(itemKind));
            this.client.hset("u: " + name, "inventory" + inventoryNumber + ":number", itemNumber.toString());
            console.info("SetInventory: " +
                name +
                ", " +
                gametypes_1["default"].getKindAsString(itemKind) +
                ", " +
                inventoryNumber +
                ", " +
                itemNumber);
        }
        else {
            this.makeEmptyInventory(name, inventoryNumber.toString());
        }
    };
    DatabaseHandler.prototype.makeEmptyInventory = function (name, number) {
        console.info("Empty Inventory: " + name + " " + number);
        this.client.hdel("u:" + name, "inventory" + number);
        this.client.hdel("u:" + name, "inventory" + number + ":number");
    };
    DatabaseHandler.prototype.foundAchievement = function (name, number) {
        console.info("Found Achievement: " + name + " " + number);
        this.client.hset("u:" + name, "achievement" + number + ":found", "true");
    };
    DatabaseHandler.prototype.progressAchievement = function (name, number, progress) {
        console.info("Progress Achievement: " + name + " " + number + " " + progress);
        this.client.hset("u:" + name, "achievement" + number + ":progress", progress);
    };
    DatabaseHandler.prototype.setUsedPubPts = function (name, usedPubPts) {
        console.info("Set Used Pub Points: " + name + " " + usedPubPts);
        this.client.hset("u:" + name, "usedPubPts", usedPubPts);
    };
    DatabaseHandler.prototype.setCheckpoint = function (name, x, y) {
        console.info("Set Check Point: " + name + " " + x + " " + y);
        this.client.hset("u:" + name, "x", x);
        this.client.hset("u:" + name, "y", y);
    };
    DatabaseHandler.prototype.loadBoard = function (player, command, number, replyNumber) {
        var _this = this;
        console.info("Load Board: " +
            player.name +
            " " +
            command +
            " " +
            number +
            " " +
            replyNumber);
        if (command === "view") {
            this.client
                .multi()
                .hget("bo:free", number + ":title")
                .hget("bo:free", number + ":content")
                .hget("bo:free", number + ":writer")
                .hincrby("bo:free", number + ":cnt", 1)
                .smembers("bo:free:" + number + ":up")
                .smembers("bo:free:" + number + ":down")
                .hget("bo:free", number + ":time")
                .exec(function (err, replies) {
                var title = replies[0];
                var content = replies[1];
                var writer = replies[2];
                var counter = replies[3];
                var up = replies[4].length;
                var down = replies[5].length;
                var time = replies[6];
                player.send([
                    gametypes_1["default"].Messages.BOARD,
                    "view",
                    title,
                    content,
                    writer,
                    counter,
                    up,
                    down,
                    time
                ]);
            });
        }
        else if (command === "reply") {
            this.client
                .multi()
                .hget("bo:free", number + ":reply:" + replyNumber + ":writer")
                .hget("bo:free", number + ":reply:" + replyNumber + ":content")
                .smembers("bo:free:" + number + ":reply:" + replyNumber + ":up")
                .smembers("bo:free:" + number + ":reply:" + replyNumber + ":down")
                .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":writer")
                .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":content")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":up")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":down")
                .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":writer")
                .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":content")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":up")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":down")
                .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":writer")
                .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":content")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":up")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":down")
                .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":writer")
                .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":content")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":up")
                .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":down")
                .exec(function (err, replies) {
                player.send([
                    gametypes_1["default"].Messages.BOARD,
                    "reply",
                    replies[0],
                    replies[1],
                    replies[2].length,
                    replies[3].length,
                    replies[4],
                    replies[5],
                    replies[6].length,
                    replies[7].length,
                    replies[8],
                    replies[9],
                    replies[10].length,
                    replies[11].length,
                    replies[12],
                    replies[13],
                    replies[14].length,
                    replies[15].length,
                    replies[16],
                    replies[17],
                    replies[18].length,
                    replies[19].length
                ]);
            });
        }
        else if (command === "up") {
            if (player.level >= 50) {
                this.client.sadd("bo:free:" + number + ":up", player.name);
            }
        }
        else if (command === "down") {
            if (player.level >= 50) {
                this.client.sadd("bo:free:" + number + ":down", player.name);
            }
        }
        else if (command === "replyup") {
            if (player.level >= 50) {
                this.client.sadd("bo:free:" + number + ":reply:" + replyNumber + ":up", player.name);
            }
        }
        else if (command === "replydown") {
            if (player.level >= 50) {
                this.client.sadd("bo:free:" + number + ":reply:" + replyNumber + ":down", player.name);
            }
        }
        else if (command === "list") {
            this.client.hget("bo:free", "lastnum", function (err, reply) {
                var lastnum = reply;
                if (number > 0) {
                    lastnum = number;
                }
                _this.client
                    .multi()
                    .hget("bo:free", lastnum + ":title")
                    .hget("bo:free", lastnum - 1 + ":title")
                    .hget("bo:free", lastnum - 2 + ":title")
                    .hget("bo:free", lastnum - 3 + ":title")
                    .hget("bo:free", lastnum - 4 + ":title")
                    .hget("bo:free", lastnum - 5 + ":title")
                    .hget("bo:free", lastnum - 6 + ":title")
                    .hget("bo:free", lastnum - 7 + ":title")
                    .hget("bo:free", lastnum - 8 + ":title")
                    .hget("bo:free", lastnum - 9 + ":title")
                    .hget("bo:free", lastnum + ":writer")
                    .hget("bo:free", lastnum - 1 + ":writer")
                    .hget("bo:free", lastnum - 2 + ":writer")
                    .hget("bo:free", lastnum - 3 + ":writer")
                    .hget("bo:free", lastnum - 4 + ":writer")
                    .hget("bo:free", lastnum - 5 + ":writer")
                    .hget("bo:free", lastnum - 6 + ":writer")
                    .hget("bo:free", lastnum - 7 + ":writer")
                    .hget("bo:free", lastnum - 8 + ":writer")
                    .hget("bo:free", lastnum - 9 + ":writer")
                    .hget("bo:free", lastnum + ":cnt")
                    .hget("bo:free", lastnum - 1 + ":cnt")
                    .hget("bo:free", lastnum - 2 + ":cnt")
                    .hget("bo:free", lastnum - 3 + ":cnt")
                    .hget("bo:free", lastnum - 4 + ":cnt")
                    .hget("bo:free", lastnum - 5 + ":cnt")
                    .hget("bo:free", lastnum - 6 + ":cnt")
                    .hget("bo:free", lastnum - 7 + ":cnt")
                    .hget("bo:free", lastnum - 8 + ":cnt")
                    .hget("bo:free", lastnum - 9 + ":cnt")
                    .smembers("bo:free:" + lastnum + ":up")
                    .smembers("bo:free:" + (lastnum - 1) + ":up")
                    .smembers("bo:free:" + (lastnum - 2) + ":up")
                    .smembers("bo:free:" + (lastnum - 3) + ":up")
                    .smembers("bo:free:" + (lastnum - 4) + ":up")
                    .smembers("bo:free:" + (lastnum - 5) + ":up")
                    .smembers("bo:free:" + (lastnum - 6) + ":up")
                    .smembers("bo:free:" + (lastnum - 7) + ":up")
                    .smembers("bo:free:" + (lastnum - 8) + ":up")
                    .smembers("bo:free:" + (lastnum - 9) + ":up")
                    .smembers("bo:free:" + lastnum + ":down")
                    .smembers("bo:free:" + (lastnum - 1) + ":down")
                    .smembers("bo:free:" + (lastnum - 2) + ":down")
                    .smembers("bo:free:" + (lastnum - 3) + ":down")
                    .smembers("bo:free:" + (lastnum - 4) + ":down")
                    .smembers("bo:free:" + (lastnum - 5) + ":down")
                    .smembers("bo:free:" + (lastnum - 6) + ":down")
                    .smembers("bo:free:" + (lastnum - 7) + ":down")
                    .smembers("bo:free:" + (lastnum - 8) + ":down")
                    .smembers("bo:free:" + (lastnum - 9) + ":down")
                    .hget("bo:free", lastnum + ":replynum")
                    .hget("bo:free", lastnum + 1 + ":replynum")
                    .hget("bo:free", lastnum + 2 + ":replynum")
                    .hget("bo:free", lastnum + 3 + ":replynum")
                    .hget("bo:free", lastnum + 4 + ":replynum")
                    .hget("bo:free", lastnum + 5 + ":replynum")
                    .hget("bo:free", lastnum + 6 + ":replynum")
                    .hget("bo:free", lastnum + 7 + ":replynum")
                    .hget("bo:free", lastnum + 8 + ":replynum")
                    .hget("bo:free", lastnum + 9 + ":replynum")
                    .exec(function (err, replies) {
                    var i = 0;
                    var msg = [gametypes_1["default"].Messages.BOARD, "list", lastnum];
                    for (i = 0; i < 30; i++) {
                        msg.push(replies[i]);
                    }
                    for (i = 30; i < 50; i++) {
                        msg.push(replies[i].length);
                    }
                    for (i = 50; i < 60; i++) {
                        msg.push(replies[i]);
                    }
                    player.send(msg);
                });
            });
        }
    };
    DatabaseHandler.prototype.writeBoard = function (player, title, content) {
        var _this = this;
        console.info("Write Board: " + player.name + " " + title);
        this.client.hincrby("bo:free", "lastnum", 1, function (err, reply) {
            var curTime = new Date().getTime();
            var number = reply ? reply : 1;
            _this.client
                .multi()
                .hset("bo:free", number + ":title", title)
                .hset("bo:free", number + ":content", content)
                .hset("bo:free", number + ":writer", player.name)
                .hset("bo:free", number + ":time", curTime)
                .exec();
            player.send([
                gametypes_1["default"].Messages.BOARD,
                "view",
                title,
                content,
                player.name,
                0,
                0,
                0,
                curTime
            ]);
        });
    };
    DatabaseHandler.prototype.writeReply = function (player, content, number) {
        var _this = this;
        console.info("Write Reply: " + player.name + " " + content + " " + number);
        this.client.hincrby("bo:free", number + ":replynum", 1, function (err, reply) {
            var replyNum = reply ? reply : 1;
            _this.client
                .multi()
                .hset("bo:free", number + ":reply:" + replyNum + ":content", content)
                .hset("bo:free", number + ":reply:" + replyNum + ":writer", player.name)
                .exec(function (err, replies) {
                player.send([gametypes_1["default"].Messages.BOARD, "reply", player.name, content]);
            });
        });
    };
    DatabaseHandler.prototype.pushKungWord = function (player, word) {
        var server = player.server;
        if (player === server.lastKungPlayer) {
            return;
        }
        if (server.isAlreadyKung(word)) {
            return;
        }
        if (!server.isRightKungWord(word)) {
            return;
        }
        if (server.kungWords.length === 0) {
            this.client.srandmember("dic", function (err, reply) {
                var randWord = reply;
                server.pushKungWord(player, randWord);
            });
        }
        else {
            this.client.sismember("dic", word, function (err, reply) {
                if (reply === 1) {
                    server.pushKungWord(player, word);
                }
                else {
                    player.send([gametypes_1["default"].Messages.NOTIFY, word + "는 사전에 없습니다."]);
                }
            });
        }
    };
    return DatabaseHandler;
}());
exports["default"] = DatabaseHandler;
