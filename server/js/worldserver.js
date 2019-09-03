"use strict";
exports.__esModule = true;
var _ = require("underscore");
var message_1 = require("./message");
var mob_1 = require("./mob");
var map_1 = require("./map");
var npc_1 = require("./npc");
var player_1 = require("./player");
var item_1 = require("./item");
var chest_1 = require("./chest");
var utils_1 = require("./utils");
var mobarea_1 = require("./mobarea");
var chestarea_1 = require("./chestarea");
var gametypes_1 = require("../../shared/js/gametypes");
var properties_1 = require("./properties");
var guild_1 = require("./guild");
var World = (function () {
    function World(id, maxPlayers, websocketServer, databaseHandler) {
        var _this = this;
        this.id = id;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 50;
        this.databaseHandler = databaseHandler;
        this.entities = {};
        this.players = {};
        this.guilds = {};
        this.mobs = {};
        this.attackers = {};
        this.items = {};
        this.equipping = {};
        this.hurt = {};
        this.npcs = {};
        this.mobAreas = [];
        this.chestAreas = [];
        this.groups = {};
        this.outgoingQueues = {};
        this.itemCount = 0;
        this.playerCount = 0;
        this.zoneGroupsReady = false;
        this.onPlayerConnect(function (player) {
            player.onRequestPosition(function () {
                if (player.lastCheckpoint) {
                    return player.lastCheckpoint.getRandomPosition();
                }
                else {
                    return _this.map.getRandomStartingPosition();
                }
            });
        });
        this.onPlayerEnter(function (player) {
            console.info(player.name +
                "(" +
                player.connection.connection.remoteAddress +
                ") has joined " +
                _this.id +
                " in guild " +
                player.guildId);
            if (!player.hasEnteredGame) {
                _this.incrementPlayerCount();
            }
            _this.pushToPlayer(player, new message_1["default"].Population(_this.playerCount));
            if (player.hasGuild()) {
                _this.pushToGuild(player.getGuild(), new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.CONNECT, player.name), player);
                var names = _.without(player.getGuild().memberNames(), player.name);
                if (names.length > 0) {
                    _this.pushToPlayer(player, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.ONLINE, names));
                }
            }
            _this.pushRelevantEntityListTo(player);
            var move_cb = function (x, y) {
                console.debug(player.name + " is moving to (" + x + ", " + y + ").");
                var isPVP = _this.map.isPVP(x, y);
                player.flagPVP(isPVP);
                player.forEachAttacker(function (mob) {
                    if (mob.target === null) {
                        player.removeAttacker(mob);
                        return;
                    }
                    var target = _this.getEntityById(mob.target);
                    if (target) {
                        var pos = _this.findPositionNextTo(mob, target);
                        if (mob.distanceToSpawningPoint(pos.x, pos.y) > 50) {
                            mob.clearTarget();
                            mob.forgetEveryone();
                            player.removeAttacker(mob);
                        }
                        else {
                            _this.moveEntity(mob, pos.x, pos.y);
                        }
                    }
                });
            };
            player.onMove(move_cb);
            player.onLootMove(move_cb);
            player.onZone(function () {
                var hasChangedGroups = _this.handleEntityGroupMembership(player);
                if (hasChangedGroups) {
                    _this.pushToPreviousGroups(player, new message_1["default"].Destroy(player));
                    _this.pushRelevantEntityListTo(player);
                }
            });
            player.onBroadcast(function (message, ignorethis) {
                _this.pushToAdjacentGroups(player.group, message, ignorethis ? player.id : null);
            });
            player.onBroadcastToZone(function (message, ignorethis) {
                _this.pushToGroup(player.group, message, ignorethis ? player.id : null);
            });
            player.onExit(function () {
                console.info(player.name + " has left the game.");
                if (player.hasGuild()) {
                    _this.pushToGuild(player.getGuild(), new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.DISCONNECT, player.name), player);
                }
                _this.removePlayer(player);
                _this.decrementPlayerCount();
                if (_this.removed_cb) {
                    _this.removed_cb();
                }
            });
            if (_this.added_cb) {
                _this.added_cb();
            }
        });
        this.onEntityAttack(function (attacker) {
            var target = _this.getEntityById(attacker.target);
            if (target && attacker.type === "mob") {
                var pos = _this.findPositionNextTo(attacker, target);
                _this.moveEntity(attacker, pos.x, pos.y);
            }
        });
        this.onRegenTick(function () {
            _this.forEachCharacter(function (character) {
                if (!character.hasFullHealth()) {
                    character.regenHealthBy(Math.floor(character.maxHitPoints / 25));
                    if (character.type === "player") {
                        _this.pushToPlayer(character, character.regen());
                    }
                }
            });
        });
    }
    World.prototype.run = function (mapFilePath) {
        var _this = this;
        this.map = new map_1["default"](mapFilePath);
        this.map.ready(function () {
            _this.initZoneGroups();
            _this.map.generateCollisionGrid();
            _.each(_this.map.mobAreas, function (a) {
                var area = new mobarea_1["default"](a.id, a.nb, a.type, a.x, a.y, a.width, a.height, _this);
                area.spawnMobs();
                area.onEmpty(_this.handleEmptyMobArea.bind(_this, area));
                _this.mobAreas.push(area);
            });
            _.each(_this.map.chestAreas, function (a) {
                var area = new chestarea_1["default"](a.id, a.x, a.y, a.w, a.h, a.tx, a.ty, a.i, _this);
                _this.chestAreas.push(area);
                area.onEmpty(_this.handleEmptyChestArea.bind(_this, area));
            });
            _.each(_this.map.staticChests, function (chest) {
                var c = _this.createChest(chest.x, chest.y, chest.i);
                _this.addStaticItem(c);
            });
            _this.spawnStaticEntities();
            _.each(_this.chestAreas, function (area) {
                area.setNumberOfEntities(area.entities.length);
            });
        });
        var regenCount = this.ups * 2;
        var updateCount = 0;
        setInterval(function () {
            _this.processGroups();
            _this.processQueues();
            if (updateCount < regenCount) {
                updateCount += 1;
            }
            else {
                if (_this.regen_cb) {
                    _this.regen_cb();
                }
                updateCount = 0;
            }
        }, 1000 / this.ups);
        console.info("" + this.id + " created (capacity: " + this.maxPlayers + " players).");
    };
    World.prototype.setUpdatesPerSecond = function (ups) {
        this.ups = ups;
    };
    World.prototype.onInit = function (cb) {
        this.init_cb = cb;
    };
    World.prototype.onPlayerConnect = function (cb) {
        this.connect_cb = cb;
    };
    World.prototype.onPlayerEnter = function (cb) {
        this.enter_cb = cb;
    };
    World.prototype.onPlayerAdded = function (cb) {
        this.added_cb = cb;
    };
    World.prototype.onPlayerRemoved = function (cb) {
        this.removed_cb = cb;
    };
    World.prototype.onRegenTick = function (cb) {
        this.regen_cb = cb;
    };
    World.prototype.pushRelevantEntityListTo = function (player) {
        var entities;
        if (player && player.group in this.groups) {
            entities = _.keys(this.groups[player.group].entities);
            entities = _.reject(entities, function (id) {
                return id == player.id;
            });
            entities = _.map(entities, function (id) {
                return parseInt(id, 10);
            });
            if (entities) {
                this.pushToPlayer(player, new message_1["default"].List(entities));
            }
        }
    };
    World.prototype.pushSpawnsToPlayer = function (player) {
        var _this = this;
        var ids = [];
        _.each(ids, function (id) {
            var entity = _this.getEntityById(id);
            if (entity) {
                _this.pushToPlayer(player, new message_1["default"].Spawn(entity));
            }
        });
        console.debug("Pushed " + _.size(ids) + " new spawns to " + player.id);
    };
    World.prototype.pushToPlayer = function (player, message) {
        if (player && player.id in this.outgoingQueues) {
            this.outgoingQueues[player.id].push(message.serialize());
        }
        else {
            console.error("pushToPlayer: player was undefined");
        }
    };
    World.prototype.pushToGuild = function (guild, message, except) {
        var _this = this;
        if (guild) {
            if (typeof except === "undefined") {
                guild.forEachMember(function (player, id) {
                    _this.pushToPlayer(_this.getEntityById(id), message);
                });
            }
            else {
                guild.forEachMember(function (player, id) {
                    if (parseInt(id, 10) !== except.id) {
                        _this.pushToPlayer(_this.getEntityById(id), message);
                    }
                });
            }
        }
        else {
            console.error("pushToGuild: guild was undefined");
        }
    };
    World.prototype.pushToGroup = function (groupId, message, ignoredPlayer) {
        var _this = this;
        var group = this.groups[groupId];
        if (group) {
            _.each(group.players, function (playerId) {
                if (playerId != ignoredPlayer) {
                    _this.pushToPlayer(_this.getEntityById(playerId), message);
                }
            });
        }
        else {
            console.error("groupId: " + groupId + " is not a valid group");
        }
    };
    World.prototype.pushToAdjacentGroups = function (groupId, message, ignoredPlayer) {
        var _this = this;
        this.map.forEachAdjacentGroup(groupId, function (id) {
            _this.pushToGroup(id, message, ignoredPlayer);
        });
    };
    World.prototype.pushToPreviousGroups = function (player, message) {
        var _this = this;
        _.each(player.recentlyLeftGroups, function (id) {
            _this.pushToGroup(id, message);
        });
        player.recentlyLeftGroups = [];
    };
    World.prototype.pushBroadcast = function (message, ignoredPlayer) {
        for (var id in this.outgoingQueues) {
            if (id != ignoredPlayer) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    };
    World.prototype.processQueues = function () {
        var connection;
        for (var id in this.outgoingQueues) {
            if (this.outgoingQueues[id].length > 0) {
                connection = this.server.getConnection(id);
                connection.send(this.outgoingQueues[id]);
                this.outgoingQueues[id] = [];
            }
        }
    };
    World.prototype.addEntity = function (entity) {
        this.entities[entity.id] = entity;
        this.handleEntityGroupMembership(entity);
    };
    World.prototype.removeEntity = function (entity) {
        if (entity.id in this.entities) {
            delete this.entities[entity.id];
        }
        if (entity.id in this.mobs) {
            delete this.mobs[entity.id];
        }
        if (entity.id in this.items) {
            delete this.items[entity.id];
        }
        if (entity.type === "mob") {
            this.clearMobAggroLink(entity);
            this.clearMobHateLinks(entity);
        }
        entity.destroy();
        this.removeFromGroups(entity);
        console.debug("Removed " + gametypes_1["default"].getKindAsString(entity.kind) + " : " + entity.id);
    };
    World.prototype.joinGuild = function (player, guildId, answer) {
        if (typeof this.guilds[guildId] === "undefined") {
            this.pushToPlayer(player, new message_1["default"].GuildError(gametypes_1["default"].Messages.GUILDERRORTYPE.DOESNOTEXIST, guildId));
        }
        else {
            var formerGuildId = void 0;
            if (player.hasGuild()) {
                formerGuildId = player.guildId;
            }
            var res = this.guilds[guildId].addMember(player, answer);
            if (res !== false && typeof formerGuildId !== "undefined") {
                this.guilds[formerGuildId].removeMember(player);
            }
            return res;
        }
        return false;
    };
    World.prototype.reloadGuild = function (guildId, guildName) {
        var res = false;
        var lastItem = 0;
        if (typeof this.guilds[guildId] !== "undefined") {
            if (this.guilds[guildId].name === guildName) {
                res = guildId;
            }
        }
        if (res === false) {
            _.every(this.guilds, function (guild, key) {
                if (guild.name === guildName) {
                    res = parseInt(key, 10);
                    return false;
                }
                else {
                    lastItem = key;
                    return true;
                }
            });
        }
        if (res === false) {
            if (typeof this.guilds[guildId] !== "undefined") {
                guildId = parseInt(lastItem, 10) + 1;
            }
            this.guilds[guildId] = new guild_1["default"](guildId, guildName, this);
            res = guildId;
        }
        return res;
    };
    World.prototype.addGuild = function (guildName) {
        var res = true;
        var id = 0;
        res = _.every(this.guilds, function (guild, key) {
            id = parseInt(key, 10) + 1;
            return guild.name !== guildName;
        });
        if (res) {
            this.guilds[id] = new guild_1["default"](id, guildName, this);
            res = id;
        }
        return res;
    };
    World.prototype.addPlayer = function (player, guildId) {
        this.addEntity(player);
        this.players[player.id] = player;
        this.outgoingQueues[player.id] = [];
        var res = true;
        if (typeof guildId !== "undefined") {
            res = this.joinGuild(player, guildId);
        }
        return res;
    };
    World.prototype.removePlayer = function (player) {
        player.broadcast(player.despawn());
        this.removeEntity(player);
        if (player.hasGuild()) {
            player.getGuild().removeMember(player);
        }
        delete this.players[player.id];
        delete this.outgoingQueues[player.id];
    };
    World.prototype.loggedInPlayer = function (name) {
        for (var id in this.players) {
            if (this.players[id].name === name) {
                if (!this.players[id].isDead)
                    return true;
            }
        }
        return false;
    };
    World.prototype.addMob = function (mob) {
        this.addEntity(mob);
        this.mobs[mob.id] = mob;
    };
    World.prototype.addNPC = function (kind, x, y) {
        var npc = new npc_1["default"]("8" + x + "" + y, kind, x, y);
        this.addEntity(npc);
        this.npcs[npc.id] = npc;
        return npc;
    };
    World.prototype.addItem = function (item) {
        this.addEntity(item);
        this.items[item.id] = item;
        return item;
    };
    World.prototype.createItem = function (kind, x, y) {
        var id = "9" + this.itemCount++, item = null;
        if (kind === gametypes_1["default"].Entities.CHEST) {
            item = new chest_1["default"](id, x, y);
        }
        else {
            item = new item_1["default"](id, kind, x, y);
        }
        return item;
    };
    World.prototype.createChest = function (x, y, items) {
        var chest = this.createItem(gametypes_1["default"].Entities.CHEST, x, y);
        chest.setItems(items);
        return chest;
    };
    World.prototype.addStaticItem = function (item) {
        item.isStatic = true;
        item.onRespawn(this.addStaticItem.bind(this, item));
        return this.addItem(item);
    };
    World.prototype.addItemFromChest = function (kind, x, y) {
        var item = this.createItem(kind, x, y);
        item.isFromChest = true;
        return this.addItem(item);
    };
    World.prototype.clearMobAggroLink = function (mob) {
        var player = null;
        if (mob.target) {
            player = this.getEntityById(mob.target);
            if (player) {
                player.removeAttacker(mob);
            }
        }
    };
    World.prototype.clearMobHateLinks = function (mob) {
        var _this = this;
        if (mob) {
            _.each(mob.hatelist, function (obj) {
                var player = _this.getEntityById(obj.id);
                if (player) {
                    player.removeHater(mob);
                }
            });
        }
    };
    World.prototype.forEachEntity = function (cb) {
        for (var id in this.entities) {
            cb(this.entities[id]);
        }
    };
    World.prototype.forEachPlayer = function (cb) {
        for (var id in this.players) {
            cb(this.players[id]);
        }
    };
    World.prototype.forEachMob = function (cb) {
        for (var id in this.mobs) {
            cb(this.mobs[id]);
        }
    };
    World.prototype.forEachCharacter = function (cb) {
        this.forEachPlayer(cb);
        this.forEachMob(cb);
    };
    World.prototype.handleMobHate = function (mobId, playerId, hatePoints) {
        var mob = this.getEntityById(mobId), player = this.getEntityById(playerId), mostHated;
        if (player && mob) {
            mob.increaseHateFor(playerId, hatePoints);
            player.addHater(mob);
            if (mob.hitPoints > 0) {
                this.chooseMobTarget(mob);
            }
        }
    };
    World.prototype.chooseMobTarget = function (mob, hateRank) {
        var player = this.getEntityById(mob.getHatedPlayerId(hateRank));
        if (player && !(mob.id in player.attackers)) {
            this.clearMobAggroLink(mob);
            player.addAttacker(mob);
            mob.setTarget(player);
            this.broadcastAttacker(mob);
            console.debug(mob.id + " is now attacking " + player.id);
        }
    };
    World.prototype.onEntityAttack = function (cb) {
        this.attack_cb = cb;
    };
    World.prototype.getEntityById = function (id) {
        if (id in this.entities) {
            return this.entities[id];
        }
        else {
            console.error("Unknown entity : " + id);
        }
    };
    World.prototype.getPlayerCount = function () {
        var count = 0;
        for (var p in this.players) {
            if (this.players.hasOwnProperty(p)) {
                count += 1;
            }
        }
        return count;
    };
    World.prototype.broadcastAttacker = function (character) {
        if (character) {
            this.pushToAdjacentGroups(character.group, character.attack(), character.id);
        }
        if (this.attack_cb) {
            this.attack_cb(character);
        }
    };
    World.prototype.handleHurtEntity = function (entity, damage) {
        var _this = this;
        entity.forEachAttacker(function (attacker) {
            if (entity.type === "player") {
                _this.pushToPlayer(entity, entity.health());
            }
            if (entity.type === "mob") {
                _this.pushToPlayer(attacker, new message_1["default"].Damage(entity, damage, entity.hitPoints, entity.maxHitPoints));
            }
            if (entity.hitPoints <= 0) {
                if (entity.type === "mob") {
                    var mob = entity, item = _this.getDroppedItem(mob);
                    var mainTanker = _this.getEntityById(mob.getMainTankerId());
                    if (mainTanker && mainTanker instanceof player_1["default"]) {
                        mainTanker.incExp(gametypes_1["default"].getMobExp(mob.kind));
                        _this.pushToPlayer(mainTanker, new message_1["default"].Kill(mob, mainTanker.level, mainTanker.experience));
                    }
                    else {
                        attacker.incExp(gametypes_1["default"].getMobExp(mob.kind));
                        _this.pushToPlayer(attacker, new message_1["default"].Kill(mob, attacker.level, attacker.experience));
                    }
                    _this.pushToAdjacentGroups(mob.group, mob.despawn());
                    if (item) {
                        _this.pushToAdjacentGroups(mob.group, mob.drop(item));
                        _this.handleItemDespawn(item);
                    }
                }
                if (entity.type === "player") {
                    _this.handlePlayerVanish(entity);
                    _this.pushToAdjacentGroups(entity.group, entity.despawn());
                }
                _this.removeEntity(entity);
            }
        });
    };
    World.prototype.despawn = function (entity) {
        this.pushToAdjacentGroups(entity.group, entity.despawn());
        if (entity.id in this.entities) {
            this.removeEntity(entity);
        }
    };
    World.prototype.spawnStaticEntities = function () {
        var _this = this;
        var count = 0;
        _.each(this.map.staticEntities, function (kindName, tid) {
            var kind = gametypes_1["default"].getKindFromString(kindName), pos = _this.map.tileIndexToGridPosition(tid);
            if (gametypes_1["default"].isNPC(kind)) {
                _this.addNPC(kind, pos.x + 1, pos.y);
            }
            if (gametypes_1["default"].isMob(kind)) {
                var mob_2 = new mob_1["default"]("7" + kind + count++, kind, pos.x + 1, pos.y);
                mob_2.onRespawn(function () {
                    mob_2.isDead = false;
                    _this.addMob(mob_2);
                    if (mob_2.area && mob_2.area instanceof chestarea_1["default"]) {
                        mob_2.area.addToArea(mob_2);
                    }
                });
                mob_2.onMove(_this.onMobMoveCallback.bind(_this));
                _this.addMob(mob_2);
                _this.tryAddingMobToChestArea(mob_2);
            }
            if (gametypes_1["default"].isItem(kind)) {
                _this.addStaticItem(_this.createItem(kind, pos.x + 1, pos.y));
            }
        });
    };
    World.prototype.isValidPosition = function (x, y) {
        if (this.map &&
            _.isNumber(x) &&
            _.isNumber(y) &&
            !this.map.isOutOfBounds(x, y) &&
            !this.map.isColliding(x, y)) {
            return true;
        }
        return false;
    };
    World.prototype.handlePlayerVanish = function (player) {
        var _this = this;
        var previousAttackers = [];
        player.forEachAttacker(function (mob) {
            previousAttackers.push(mob);
            _this.chooseMobTarget(mob, 2);
        });
        _.each(previousAttackers, function (mob) {
            player.removeAttacker(mob);
            mob.clearTarget();
            mob.forgetPlayer(player.id, 1000);
        });
        this.handleEntityGroupMembership(player);
    };
    World.prototype.setPlayerCount = function (count) {
        this.playerCount = count;
    };
    World.prototype.incrementPlayerCount = function () {
        this.setPlayerCount(this.playerCount + 1);
    };
    World.prototype.decrementPlayerCount = function () {
        if (this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    };
    World.prototype.getDroppedItem = function (mob) {
        var kind = gametypes_1["default"].getKindAsString(mob.kind), drops = properties_1["default"][kind].drops, v = utils_1["default"].random(100), p = 0, item = null;
        for (var itemName in drops) {
            var percentage = drops[itemName];
            p += percentage;
            if (v <= p) {
                item = this.addItem(this.createItem(gametypes_1["default"].getKindFromString(itemName), mob.x, mob.y));
                break;
            }
        }
        return item;
    };
    World.prototype.onMobMoveCallback = function (mob) {
        this.pushToAdjacentGroups(mob.group, new message_1["default"].Move(mob));
        this.handleEntityGroupMembership(mob);
    };
    World.prototype.findPositionNextTo = function (entity, target) {
        var valid = false, pos = { x: 0, y: 0 };
        while (!valid) {
            pos = entity.getPositionNextTo(target);
            valid = this.isValidPosition(pos.x, pos.y);
        }
        return pos;
    };
    World.prototype.initZoneGroups = function () {
        var _this = this;
        this.map.forEachGroup(function (id) {
            _this.groups[id] = { entities: {}, players: [], incoming: [] };
        });
        this.zoneGroupsReady = true;
    };
    World.prototype.removeFromGroups = function (entity) {
        var _this = this;
        var oldGroups = [];
        if (entity && entity.group) {
            var group = this.groups[entity.group];
            if (entity instanceof player_1["default"]) {
                group.players = _.reject(group.players, function (id) {
                    return id === entity.id;
                });
            }
            this.map.forEachAdjacentGroup(entity.group, function (id) {
                if (entity.id in _this.groups[id].entities) {
                    delete _this.groups[id].entities[entity.id];
                    oldGroups.push(id);
                }
            });
            entity.group = null;
        }
        return oldGroups;
    };
    World.prototype.addAsIncomingToGroup = function (entity, groupId) {
        var _this = this;
        var isChest = entity && entity instanceof chest_1["default"], isItem = entity && entity instanceof item_1["default"], isDroppedItem = entity && isItem && !entity.isStatic && !entity.isFromChest;
        if (entity && groupId) {
            this.map.forEachAdjacentGroup(groupId, function (id) {
                var group = _this.groups[id];
                if (group) {
                    if (!_.include(group.entities, entity.id) &&
                        (!isItem || isChest || (isItem && !isDroppedItem))) {
                        group.incoming.push(entity);
                    }
                }
            });
        }
    };
    World.prototype.addToGroup = function (entity, groupId) {
        var _this = this;
        var newGroups = [];
        if (entity && groupId && groupId in this.groups) {
            this.map.forEachAdjacentGroup(groupId, function (id) {
                _this.groups[id].entities[entity.id] = entity;
                newGroups.push(id);
            });
            entity.group = groupId;
            if (entity instanceof player_1["default"]) {
                this.groups[groupId].players.push(entity.id);
            }
        }
        return newGroups;
    };
    World.prototype.logGroupPlayers = function (groupId) {
        console.debug("Players inside group " + groupId + ":");
        _.each(this.groups[groupId].players, function (id) {
            console.debug("- player " + id);
        });
    };
    World.prototype.handleEntityGroupMembership = function (entity) {
        var hasChangedGroups = false;
        if (entity) {
            var groupId = this.map.getGroupIdFromPosition(entity.x, entity.y);
            if (!entity.group || (entity.group && entity.group !== groupId)) {
                hasChangedGroups = true;
                this.addAsIncomingToGroup(entity, groupId);
                var oldGroups = this.removeFromGroups(entity);
                var newGroups = this.addToGroup(entity, groupId);
                if (_.size(oldGroups) > 0) {
                    entity.recentlyLeftGroups = _.difference(oldGroups, newGroups);
                    console.debug("group diff: " + entity.recentlyLeftGroups);
                }
            }
        }
        return hasChangedGroups;
    };
    World.prototype.processGroups = function () {
        var _this = this;
        if (this.zoneGroupsReady) {
            this.map.forEachGroup(function (id) {
                var spawns = [];
                if (_this.groups[id].incoming.length > 0) {
                    spawns = _.each(_this.groups[id].incoming, function (entity) {
                        if (entity instanceof player_1["default"]) {
                            _this.pushToGroup(id, new message_1["default"].Spawn(entity), entity.id);
                        }
                        else {
                            _this.pushToGroup(id, new message_1["default"].Spawn(entity));
                        }
                    });
                    _this.groups[id].incoming = [];
                }
            });
        }
    };
    World.prototype.moveEntity = function (entity, x, y) {
        if (entity) {
            entity.setPosition(x, y);
            this.handleEntityGroupMembership(entity);
        }
    };
    World.prototype.handleItemDespawn = function (item) {
        if (item) {
            item.handleDespawn({
                beforeBlinkDelay: 10000,
                blinkCallback: function () {
                    this.pushToAdjacentGroups(item.group, new message_1["default"].Blink(item));
                },
                blinkingDuration: 4000,
                despawnCallback: function () {
                    this.pushToAdjacentGroups(item.group, new message_1["default"].Destroy(item));
                    this.removeEntity(item);
                }
            });
        }
    };
    World.prototype.handleEmptyMobArea = function (area) { };
    World.prototype.handleEmptyChestArea = function (area) {
        if (area) {
            var chest = this.addItem(this.createChest(area.chestX, area.chestY, area.items));
            this.handleItemDespawn(chest);
        }
    };
    World.prototype.handleOpenedChest = function (chest, player) {
        this.pushToAdjacentGroups(chest.group, chest.despawn());
        this.removeEntity(chest);
        var kind = chest.getRandomItem();
        if (kind) {
            var item = this.addItemFromChest(kind, chest.x, chest.y);
            this.handleItemDespawn(item);
        }
    };
    World.prototype.getPlayerByName = function (name) {
        for (var id in this.players) {
            if (this.players[id].name === name) {
                return this.players[id];
            }
        }
        return null;
    };
    World.prototype.tryAddingMobToChestArea = function (mob) {
        _.each(this.chestAreas, function (area) {
            if (area.contains(mob)) {
                area.addToArea(mob);
            }
        });
    };
    World.prototype.updatePopulation = function (totalPlayers) {
        this.pushBroadcast(new message_1["default"].Population(this.playerCount, totalPlayers ? totalPlayers : this.playerCount));
    };
    return World;
}());
exports["default"] = World;
