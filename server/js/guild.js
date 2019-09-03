"use strict";
exports.__esModule = true;
var _ = require("underscore");
var message_1 = require("./message");
var format_1 = require("./format");
var check = new format_1["default"]().check;
var gametypes_1 = require("../../shared/js/gametypes");
var Guild = (function () {
    function Guild(id, name, server) {
        this.members = {};
        this.sentInvites = {};
        this.id = id;
        this.name = name;
        this.server = server;
    }
    Guild.prototype.addMember = function (player, reply) {
        if (typeof this.members[player.id] !== "undefined") {
            console.error("Add to guild: player conflict (" + player.id + " already exists)");
            this.deleteInvite(player.id);
            return false;
        }
        else {
            var proceed = true;
            if (typeof reply !== "undefined") {
                proceed = this.checkInvite(player) && reply;
                if (reply === false) {
                    this.server.pushToGuild(this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.JOIN, [
                        player.name,
                        false
                    ]), player);
                    this.deleteInvite(player.id);
                    return false;
                }
            }
            if (proceed) {
                this.members[player.id] = player.name;
                player.setGuildId(this.id);
                this.server.pushToGuild(this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.POPULATION, [
                    this.name,
                    this.onlineMemberCount()
                ]));
                if (typeof reply !== "undefined") {
                    this.server.pushToGuild(this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.JOIN, [
                        player.name,
                        player.id,
                        this.id,
                        this.name
                    ]));
                    this.deleteInvite(player.id);
                }
            }
            return player.id;
        }
    };
    Guild.prototype.invite = function (invitee, invitor) {
        if (typeof this.members[invitee.id] !== "undefined") {
            this.server.pushToPlayer(invitor, new message_1["default"].GuildError(gametypes_1["default"].Messages.GUILDERRORTYPE.BADINVITE, invitee.name));
        }
        else {
            this.sentInvites[invitee.id] = new Date().valueOf();
            this.server.pushToPlayer(invitee, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.INVITE, [
                this.id,
                this.name,
                invitor.name
            ]));
        }
    };
    Guild.prototype.deleteInvite = function (inviteeId) {
        delete this.sentInvites[inviteeId];
    };
    Guild.prototype.checkInvite = function (invitee) {
        var _this = this;
        var now = new Date().valueOf();
        _.each(this.sentInvites, function (time, id) {
            if (now - time > 600000) {
                var belated = _this.server.getEntityById(id);
                _this.deleteInvite(id);
                _this.server.pushToGuild(_this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.JOIN, belated.name), belated);
            }
        });
        return typeof this.sentInvites[invitee.id] !== "undefined";
    };
    Guild.prototype.removeMember = function (player) {
        if (typeof this.members[player.id] !== undefined) {
            delete this.members[player.id];
            this.server.pushToGuild(this, new message_1["default"].Guild(gametypes_1["default"].Messages.GUILDACTION.POPULATION, [
                this.name,
                this.onlineMemberCount()
            ]));
            return true;
        }
        else {
            console.error("Remove from guild: player conflict (" + player.id + " does not exist)");
            return false;
        }
    };
    Guild.prototype.forEachMember = function (iterator) {
        _.each(this.members, iterator);
    };
    Guild.prototype.memberNames = function () {
        return _.map(this.members, function (name) {
            return name;
        });
    };
    Guild.prototype.onlineMemberCount = function () {
        return _.size(this.members);
    };
    return Guild;
}());
exports["default"] = Guild;
