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
var message_1 = require("./message");
var formulas_1 = require("./formulas");
var chest_1 = require("./chest");
var character_1 = require("./character");
var properties_1 = require("./properties");
var utils_1 = require("./utils");
var format_1 = require("./format");
var gametypes_1 = require("../../shared/js/gametypes");
var bcrypt = require("bcrypt");
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(connection, worldServer, databaseHandler) {
        var _this = _super.call(this, connection.id, "player", gametypes_1["default"].Entities.WARRIOR, 0, 0) || this;
        _this.server = worldServer;
        _this.connection = connection;
        _this.databaseHandler = databaseHandler;
        _this.hasEnteredGame = false;
        _this.isDead = false;
        _this.haters = {};
        _this.lastCheckpoint = null;
        _this.disconnectTimeout = null;
        _this.pvpFlag = false;
        _this.bannedTime = 0;
        _this.banUseTime = 0;
        _this.experience = 0;
        _this.level = 0;
        _this.lastWorldChatMinutes = 99;
        _this.inventory = [];
        _this.inventoryCount = [];
        _this.achievement = [];
        _this.chatBanEndTime = 0;
        _this.connection.listen(function (message) {
            var action = parseInt(message[0]);
            console.debug("Received: " + message);
            if (!new format_1["default"]().check(message)) {
                _this.connection.close("Invalid " + gametypes_1["default"].getMessageTypeAsString(action) + " message format: " + message);
                return;
            }
            if (!_this.hasEnteredGame &&
                action !== gametypes_1["default"].Messages.CREATE &&
                action !== gametypes_1["default"].Messages.LOGIN) {
                _this.connection.close("Invalid handshake message: " + message);
                return;
            }
            if (_this.hasEnteredGame &&
                !_this.isDead &&
                (action === gametypes_1["default"].Messages.CREATE || action === gametypes_1["default"].Messages.LOGIN)) {
                _this.connection.close("Cannot initiate handshake twice: " + message);
                return;
            }
            _this.resetTimeout();
            if (action === gametypes_1["default"].Messages.CREATE || action === gametypes_1["default"].Messages.LOGIN) {
                var name_1 = utils_1["default"].sanitize(message[1]);
                var pw = utils_1["default"].sanitize(message[2]);
                _this.name = name_1.substr(0, 12).trim();
                if (!_this.checkName(_this.name)) {
                    _this.connection.sendUTF8("invalidusername");
                    _this.connection.close("Invalid name " + _this.name);
                    return;
                }
                _this.pw = pw.substr(0, 15);
                if (action === gametypes_1["default"].Messages.CREATE) {
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err)
                            throw new Error(err.message);
                        bcrypt.hash(_this.pw, salt, function (err, hash) {
                            if (err)
                                throw new Error(err.message);
                            console.info("CREATE: " + _this.name);
                            _this.email = utils_1["default"].sanitize(message[3]);
                            _this.pw = hash;
                            databaseHandler.createPlayer(_this);
                        });
                    });
                }
                else {
                    console.info("LOGIN: " + _this.name);
                    if (_this.server.loggedInPlayer(_this.name)) {
                        _this.connection.sendUTF8("loggedin");
                        _this.connection.close("Already logged in " + _this.name);
                        return;
                    }
                    databaseHandler.checkBan(_this);
                    databaseHandler.loadPlayer(_this);
                }
            }
            else if (action === gametypes_1["default"].Messages.WHO) {
                console.info("WHO: " + _this.name);
                message.shift();
                _this.server.pushSpawnsToPlayer(_this, message);
            }
            else if (action === gametypes_1["default"].Messages.ZONE) {
                console.info("ZONE: " + _this.name);
                _this.zone_cb();
            }
            else if (action === gametypes_1["default"].Messages.CHAT) {
                var msg = utils_1["default"].sanitize(message[1]);
                console.info("CHAT: " + _this.name + ": " + msg);
                if (msg && msg !== "") {
                    msg = msg.substr(0, 60);
                    _this.broadcastToZone(new message_1["default"].Chat(_this, msg), false);
                }
            }
            else if (action === gametypes_1["default"].Messages.MOVE) {
                console.info("MOVE: " + _this.name + "(" + message[1] + ", " + message[2] + ")");
                if (_this.move_cb) {
                    var x = message[1], y = message[2];
                    if (_this.server.isValidPosition(x, y)) {
                        _this.setPosition(x, y);
                        _this.clearTarget();
                        _this.broadcast(new message_1["default"].Move(_this));
                        _this.move_cb(_this.x, _this.y);
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.LOOTMOVE) {
                console.info("LOOTMOVE: " + _this.name + "(" + message[1] + ", " + message[2] + ")");
                if (_this.lootmove_cb) {
                    _this.setPosition(message[1], message[2]);
                    var item = _this.server.getEntityById(message[3]);
                    if (item) {
                        _this.clearTarget();
                        _this.broadcast(new message_1["default"].LootMove(_this, item));
                        _this.lootmove_cb(_this.x, _this.y);
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.AGGRO) {
                console.info("AGGRO: " + _this.name + " " + message[1]);
                if (_this.move_cb) {
                    _this.server.handleMobHate(message[1], _this.id, 5);
                }
            }
            else if (action === gametypes_1["default"].Messages.ATTACK) {
                console.info("ATTACK: " + _this.name + " " + message[1]);
                var mob = _this.server.getEntityById(message[1]);
                if (mob) {
                    _this.setTarget(mob);
                    _this.server.broadcastAttacker(_this);
                }
            }
            else if (action === gametypes_1["default"].Messages.HIT) {
                console.info("HIT: " + _this.name + " " + message[1]);
                var mob = _this.server.getEntityById(message[1]);
                if (mob) {
                    var dmg = formulas_1["default"].dmg(_this.weaponLevel, mob.armorLevel);
                    if (dmg > 0) {
                        if (mob.type !== "player") {
                            mob.receiveDamage(dmg, _this.id);
                            _this.server.handleMobHate(mob.id, _this.id, dmg);
                            _this.server.handleHurtEntity(mob, _this, dmg);
                        }
                    }
                    else {
                        mob.hitPoints -= dmg;
                        mob.server.handleHurtEntity(mob);
                        if (mob.hitPoints <= 0) {
                            mob.isDead = true;
                            _this.server.pushBroadcast(new message_1["default"].Chat(_this, _this.name + "M-M-M-MONSTER KILLED" + mob.name));
                        }
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.HURT) {
                console.info("HURT: " + _this.name + " " + message[1]);
                var mob = _this.server.getEntityById(message[1]);
                if (mob && _this.hitPoints > 0) {
                    _this.hitPoints -= formulas_1["default"].dmg(mob.weaponLevel, _this.armorLevel);
                    _this.server.handleHurtEntity(_this);
                    if (_this.hitPoints <= 0) {
                        _this.isDead = true;
                        if (_this.firepotionTimeout) {
                            clearTimeout(_this.firepotionTimeout);
                        }
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.LOOT) {
                console.info("LOOT: " + _this.name + " " + message[1]);
                var item = _this.server.getEntityById(message[1]);
                if (item) {
                    var kind = item.kind;
                    if (gametypes_1["default"].isItem(kind)) {
                        _this.broadcast(item.despawn());
                        _this.server.removeEntity(item);
                        if (kind === gametypes_1["default"].Entities.FIREPOTION) {
                            _this.updateHitPoints();
                            _this.broadcast(_this.equip(gametypes_1["default"].Entities.FIREFOX));
                            _this.firepotionTimeout = setTimeout(function () {
                                _this.broadcast(_this.equip(_this.armor));
                                _this.firepotionTimeout = null;
                            }, 15000);
                            _this.send(new message_1["default"].HitPoints(_this.maxHitPoints).serialize());
                        }
                        else if (gametypes_1["default"].isHealingItem(kind)) {
                            var amount = 0;
                            switch (kind) {
                                case gametypes_1["default"].Entities.FLASK:
                                    amount = 40;
                                    break;
                                case gametypes_1["default"].Entities.BURGER:
                                    amount = 100;
                                    break;
                            }
                            if (!_this.hasFullHealth()) {
                                _this.regenHealthBy(amount);
                                _this.server.pushToPlayer(_this, _this.health());
                            }
                        }
                        else if (gametypes_1["default"].isArmor(kind) || gametypes_1["default"].isWeapon(kind)) {
                            _this.equipItem(item.kind);
                            _this.broadcast(_this.equip(kind));
                        }
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.TELEPORT) {
                console.info("TELEPORT: " + _this.name + "(" + message[1] + ", " + message[2] + ")");
                var x = message[1], y = message[2];
                if (_this.server.isValidPosition(x, y)) {
                    _this.setPosition(x, y);
                    _this.clearTarget();
                    _this.broadcast(new message_1["default"].Teleport(_this));
                    _this.server.handlePlayerVanish(_this);
                    _this.server.pushRelevantEntityListTo(_this);
                }
            }
            else if (action === gametypes_1["default"].Messages.OPEN) {
                console.info("OPEN: " + _this.name + " " + message[1]);
                var chest = _this.server.getEntityById(message[1]);
                if (chest && chest instanceof chest_1["default"]) {
                    _this.server.handleOpenedChest(chest, _this);
                }
            }
            else if (action === gametypes_1["default"].Messages.CHECK) {
                console.info("CHECK: " + _this.name + " " + message[1]);
                var checkpoint = _this.server.map.getCheckpoint(message[1]);
                if (checkpoint) {
                    _this.lastCheckpoint = checkpoint;
                    databaseHandler.setCheckpoint(_this.name, _this.x, _this.y);
                }
            }
            else if (action === gametypes_1["default"].Messages.INVENTORY) {
                console.info("INVENTORY: " + _this.name + " " + message[1] + " " + message[2] + " " + message[3]);
                var inventoryNumber = message[2], count = message[3];
                if (inventoryNumber !== 0 && inventoryNumber !== 1) {
                    return;
                }
                var itemKind = _this.inventory[inventoryNumber];
                if (itemKind) {
                    if (message[1] === "avatar" || message[1] === "armor") {
                        if (message[1] === "avatar") {
                            _this.inventory[inventoryNumber] = null;
                            databaseHandler.makeEmptyInventory(_this.name, inventoryNumber);
                            _this.equipItem(itemKind, true);
                        }
                        else {
                            _this.inventory[inventoryNumber] = _this.armor;
                            databaseHandler.setInventory(_this.name, _this.armor, inventoryNumber, 1);
                            _this.equipItem(itemKind, false);
                        }
                        _this.broadcast(_this.equip(itemKind));
                    }
                    else if (message[1] === "empty") {
                        var item = _this.server.addItemFromChest(itemKind, _this.x, _this.y);
                        if (gametypes_1["default"].isHealingItem(item.kind)) {
                            if (count < 0)
                                count = 0;
                            else if (count > _this.inventoryCount[inventoryNumber])
                                count = _this.inventoryCount[inventoryNumber];
                            item.count = count;
                        }
                        if (item.count > 0) {
                            _this.server.handleItemDespawn(item);
                            if (gametypes_1["default"].isHealingItem(item.kind)) {
                                if (item.count === _this.inventoryCount[inventoryNumber]) {
                                    _this.inventory[inventoryNumber] = null;
                                    databaseHandler.makeEmptyInventory(_this.name, inventoryNumber);
                                }
                                else {
                                    _this.inventoryCount[inventoryNumber] -= item.count;
                                    databaseHandler.setInventory(_this.name, _this.inventory[inventoryNumber], inventoryNumber, _this.inventoryCount[inventoryNumber]);
                                }
                            }
                            else {
                                _this.inventory[inventoryNumber] = null;
                                databaseHandler.makeEmptyInventory(_this.name, inventoryNumber);
                            }
                        }
                    }
                    else if (message[1] === "eat") {
                        var amount = 0;
                        switch (itemKind) {
                            case gametypes_1["default"].Entities.FLASK:
                                amount = 80;
                                break;
                            case gametypes_1["default"].Entities.BURGER:
                                amount = 200;
                                break;
                        }
                        if (!_this.hasFullHealth()) {
                            _this.regenHealthBy(amount);
                            _this.server.pushToPlayer(_this, _this.health());
                        }
                        _this.inventoryCount[inventoryNumber] -= 1;
                        if (_this.inventoryCount[inventoryNumber] <= 0) {
                            _this.inventory[inventoryNumber] = null;
                        }
                        databaseHandler.setInventory(_this.name, _this.inventory[inventoryNumber], inventoryNumber, _this.inventoryCount[inventoryNumber]);
                    }
                }
            }
            else if (action === gametypes_1["default"].Messages.ACHIEVEMENT) {
                console.info("ACHIEVEMENT: " + _this.name + " " + message[1] + " " + message[2]);
                if (message[2] === "found") {
                    _this.achievement[message[1]].found = true;
                    databaseHandler.foundAchievement(_this.name, message[1]);
                }
            }
            else if (action === gametypes_1["default"].Messages.GUILD) {
                if (message[1] === gametypes_1["default"].Messages.GUILDACTION.CREATE) {
                    var guildname = utils_1["default"].sanitize(message[2]);
                    if (guildname === "") {
                        _this.server.pushToPlayer(_this, new message_1["default"].GuildError(gametypes_1["default"].Messages.GUILDERRORTYPE.BADNAME, message[2]));
                    }
                    else {
                        var guildId = _this.server.addGuild(guildname);
                        if (guildId === false) {
                            _this.server.pushToPlayer(_this, new message_1["default"].GuildError(gametypes_1["default"].Messages.GUILDERRORTYPE.ALREADYEXISTS, guildname));
                        }
                        else {
                            _this.server.joinGuild(_this, guildId);
                            _this.server.pushToPlayer(_this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.CREATE, [
                                guildId,
                                guildname
                            ]));
                        }
                    }
                }
                else if (message[1] === gametypes_1["default"].Messages.GUILDACTION.INVITE) {
                    var userName_1 = message[2];
                    var invitee = void 0;
                    if (_this.group in _this.server.groups) {
                        invitee = _.find(_this.server.groups[_this.group].entities, function (entity, key) {
                            return entity instanceof Player && entity.name == userName_1
                                ? entity
                                : false;
                        });
                        if (invitee) {
                            _this.getGuild().invite(invitee, _this);
                        }
                    }
                }
                else if (message[1] === gametypes_1["default"].Messages.GUILDACTION.JOIN) {
                    _this.server.joinGuild(_this, message[2], message[3]);
                }
                else if (message[1] === gametypes_1["default"].Messages.GUILDACTION.LEAVE) {
                    _this.leaveGuild();
                }
                else if (message[1] === gametypes_1["default"].Messages.GUILDACTION.TALK) {
                    _this.server.pushToGuild(_this.getGuild(), new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.TALK, [
                        _this.name,
                        _this.id,
                        message[2]
                    ]));
                }
            }
            else {
                if (_this.message_cb) {
                    _this.message_cb(message);
                }
            }
        });
        _this.connection.onClose(function () {
            if (_this.firepotionTimeout) {
                clearTimeout(_this.firepotionTimeout);
            }
            clearTimeout(_this.disconnectTimeout);
            if (_this.exit_cb) {
                _this.exit_cb();
            }
        });
        _this.connection.sendUTF8("go");
        return _this;
    }
    Player.prototype.zone_cb = function () {
        throw new Error("Method not implemented.");
    };
    Player.prototype.destroy = function () {
        var _this = this;
        this.forEachAttacker(function (mob) {
            mob.clearTarget();
        });
        this.attackers = {};
        this.forEachHater(function (mob) {
            mob.forgetPlayer(_this.id);
        });
        this.haters = {};
    };
    Player.prototype.getState = function () {
        var basestate = this.getBaseState(), state = [
            this.name,
            this.orientation,
            this.armor,
            this.weapon,
            this.level
        ];
        if (this.target) {
            state.push(this.target);
        }
        return basestate.concat(state);
    };
    Player.prototype.send = function (message) {
        this.connection.send(message);
    };
    Player.prototype.flagPVP = function (pvpFlag) {
        if (this.pvpFlag != pvpFlag) {
            this.pvpFlag = pvpFlag;
            this.send(new message_1["default"].PVP(this.pvpFlag).serialize());
        }
    };
    Player.prototype.broadcast = function (message, ignorethis) {
        if (this.broadcast_cb) {
            this.broadcast_cb(message, ignorethis === undefined ? true : ignorethis);
        }
    };
    Player.prototype.broadcastToZone = function (message, ignorethis) {
        if (this.broadcastzone_cb) {
            this.broadcastzone_cb(message, ignorethis === undefined ? true : ignorethis);
        }
    };
    Player.prototype.onExit = function (cb) {
        this.exit_cb = cb;
    };
    Player.prototype.onMove = function (cb) {
        this.move_cb = cb;
    };
    Player.prototype.onLootMove = function (cb) {
        this.lootmove_cb = cb;
    };
    Player.prototype.onZone = function (cb) {
        this.zone_cb = cb;
    };
    Player.prototype.onOrient = function (cb) {
        this.orient_cb = cb;
    };
    Player.prototype.onMessage = function (cb) {
        this.message_cb = cb;
    };
    Player.prototype.onBroadcast = function (cb) {
        this.broadcast_cb = cb;
    };
    Player.prototype.onBroadcastToZone = function (cb) {
        this.broadcastzone_cb = cb;
    };
    Player.prototype.equip = function (item) {
        return new message_1["default"].EquipItem(this, item);
    };
    Player.prototype.addHater = function (mob) {
        if (mob) {
            if (!(mob.id in this.haters)) {
                this.haters[mob.id] = mob;
            }
        }
    };
    Player.prototype.removeHater = function (mob) {
        if (mob && mob.id in this.haters) {
            delete this.haters[mob.id];
        }
    };
    Player.prototype.forEachHater = function (cb) {
        _.each(this.haters, function (mob) {
            cb(mob);
        });
    };
    Player.prototype.equipArmor = function (kind) {
        this.armor = kind;
        this.armorLevel = properties_1["default"].getArmorLevel(kind);
    };
    Player.prototype.equipAvatar = function (kind) {
        if (kind) {
            this.avatar = kind;
        }
        else {
            this.avatar = gametypes_1["default"].Entities.CLOTHARMOR;
        }
    };
    Player.prototype.equipWeapon = function (kind) {
        this.weapon = kind;
        this.weaponLevel = properties_1["default"].getWeaponLevel(kind);
    };
    Player.prototype.equipItem = function (itemKind, isAvatar) {
        if (itemKind) {
            console.debug(this.name + " equips " + gametypes_1["default"].getKindAsString(itemKind));
            if (gametypes_1["default"].isArmor(itemKind)) {
                if (isAvatar) {
                    this.databaseHandler.equipAvatar(this.name, gametypes_1["default"].getKindAsString(itemKind));
                    this.equipAvatar(itemKind);
                }
                else {
                    this.databaseHandler.equipAvatar(this.name, gametypes_1["default"].getKindAsString(itemKind));
                    this.equipAvatar(itemKind);
                    this.databaseHandler.equipArmor(this.name, gametypes_1["default"].getKindAsString(itemKind));
                    this.equipArmor(itemKind);
                }
                this.updateHitPoints();
                this.send(new message_1["default"].HitPoints(this.maxHitPoints).serialize());
            }
            else if (gametypes_1["default"].isWeapon(itemKind)) {
                this.databaseHandler.equipWeapon(this.name, gametypes_1["default"].getKindAsString(itemKind));
                this.equipWeapon(itemKind);
            }
        }
    };
    Player.prototype.updateHitPoints = function () {
        this.resetHitPoints(formulas_1["default"].hp(this.armorLevel));
    };
    Player.prototype.updatePosition = function () {
        if (this.requestpos_cb) {
            var pos = this.requestpos_cb();
            this.setPosition(pos.x, pos.y);
        }
    };
    Player.prototype.onRequestPosition = function (cb) {
        this.requestpos_cb = cb;
    };
    Player.prototype.resetTimeout = function () {
        clearTimeout(this.disconnectTimeout);
        this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15);
    };
    Player.prototype.timeout = function () {
        this.connection.sendUTF8("timeout");
        this.connection.close("Player was idle for too long");
    };
    Player.prototype.incExp = function (gotexp) {
        this.experience = parseInt(this.experience) + parseInt(gotexp);
        this.databaseHandler.setExp(this.name, this.experience);
        var origLevel = this.level;
        this.level = gametypes_1["default"].getLevel(this.experience);
        if (origLevel !== this.level) {
            this.updateHitPoints();
            this.send(new message_1["default"].HitPoints(this.maxHitPoints).serialize());
        }
    };
    Player.prototype.setGuildId = function (id) {
        if (typeof this.server.guilds[id] !== "undefined") {
            this.guildId = id;
        }
        else {
            console.error(this.id + " cannot add guild " + id + ", it does not exist");
        }
    };
    Player.prototype.getGuild = function () {
        return this.hasGuild ? this.server.guilds[this.guildId] : undefined;
    };
    Player.prototype.hasGuild = function () {
        return typeof this.guildId !== "undefined";
    };
    Player.prototype.leaveGuild = function () {
        if (this.hasGuild()) {
            var leftGuild = this.getGuild();
            leftGuild.removeMember(this);
            this.server.pushToGuild(leftGuild, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.LEAVE, [
                this.name,
                this.id,
                leftGuild.name
            ]));
            delete this.guildId;
            this.server.pushToPlayer(this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.LEAVE, [
                this.name,
                this.id,
                leftGuild.name
            ]));
        }
        else {
            this.server.pushToPlayer(this, new message_1["default"].GuildError(gametypes_1["default"].Messages.GUILDERRORTYPE.NOLEAVE, ""));
        }
    };
    Player.prototype.checkName = function (name) {
        if (name === null)
            return false;
        else if (name === "")
            return false;
        else if (name === " ")
            return false;
        for (var i = 0; i < name.length; i++) {
            var c = name.charCodeAt(i);
            if (!((0xac00 <= c && c <= 0xd7a3) ||
                (0x3131 <= c && c <= 0x318e) ||
                (0x61 <= c && c <= 0x7a) ||
                (0x41 <= c && c <= 0x5a) ||
                (0x30 <= c && c <= 0x39) ||
                c == 0x20 ||
                c == 0x5f ||
                c == 0x28 ||
                c == 0x29 ||
                c == 0x5e)) {
                return false;
            }
        }
        return true;
    };
    Player.prototype.sendWelcome = function (armor, weapon, avatar, weaponAvatar, exp, admin, bannedTime, banUseTime, inventory, inventoryNumber, achievementFound, achievementProgress, x, y, chatBanEndTime) {
        this.kind = gametypes_1["default"].Entities.WARRIOR;
        this.admin = admin;
        this.equipArmor(gametypes_1["default"].getKindFromString(armor));
        this.equipAvatar(gametypes_1["default"].getKindFromString(avatar));
        this.equipWeapon(gametypes_1["default"].getKindFromString(weapon));
        this.inventory[0] = gametypes_1["default"].getKindFromString(inventory[0]);
        this.inventory[1] = gametypes_1["default"].getKindFromString(inventory[1]);
        this.inventoryCount[0] = inventoryNumber[0];
        this.inventoryCount[1] = inventoryNumber[1];
        this.achievement[1] = {
            found: achievementFound[0],
            progress: achievementProgress[0]
        };
        this.achievement[2] = {
            found: achievementFound[1],
            progress: achievementProgress[1]
        };
        this.achievement[3] = {
            found: achievementFound[2],
            progress: achievementProgress[2]
        };
        this.achievement[4] = {
            found: achievementFound[3],
            progress: achievementProgress[3]
        };
        this.achievement[5] = {
            found: achievementFound[4],
            progress: achievementProgress[4]
        };
        this.achievement[6] = {
            found: achievementFound[5],
            progress: achievementProgress[5]
        };
        this.achievement[7] = {
            found: achievementFound[6],
            progress: achievementProgress[6]
        };
        this.achievement[8] = {
            found: achievementFound[7],
            progress: achievementProgress[7]
        };
        this.bannedTime = bannedTime;
        this.banUseTime = banUseTime;
        this.experience = exp;
        this.level = gametypes_1["default"].getLevel(this.experience);
        this.orientation = utils_1["default"].randomOrientation;
        this.updateHitPoints();
        if (x === 0 && y === 0) {
            this.updatePosition();
        }
        else {
            this.setPosition(x, y);
        }
        this.chatBanEndTime = chatBanEndTime;
        this.server.addPlayer(this);
        this.server.enter_cb(this);
        this.send([
            gametypes_1["default"].Messages.WELCOME,
            this.id,
            this.name,
            this.x,
            this.y,
            this.hitPoints,
            armor,
            weapon,
            avatar,
            weaponAvatar,
            this.experience,
            this.admin,
            inventory[0],
            inventoryNumber[0],
            inventory[1],
            inventoryNumber[1],
            achievementFound[0],
            achievementProgress[0],
            achievementFound[1],
            achievementProgress[1],
            achievementFound[2],
            achievementProgress[2],
            achievementFound[3],
            achievementProgress[3],
            achievementFound[4],
            achievementProgress[4],
            achievementFound[5],
            achievementProgress[5],
            achievementFound[6],
            achievementProgress[6],
            achievementFound[7],
            achievementProgress[7]
        ]);
        this.hasEnteredGame = true;
        this.isDead = false;
    };
    return Player;
}(character_1["default"]));
exports["default"] = Player;
