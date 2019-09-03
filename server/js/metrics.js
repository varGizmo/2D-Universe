"use strict";
exports.__esModule = true;
var _ = require("underscore");
var Metrics = (function () {
    function Metrics(config) {
        var _this = this;
        this.config = config;
        this.client = new (require("memcache")).Client(config.memcached_port, config.memcached_host);
        this.client.connect();
        this.isReady = false;
        this.client.on("connect", function () {
            console.info("Metrics enabled: memcached client connected to " + config.memcached_host + ": " + config.memcached_port);
            _this.isReady = true;
            if (_this.readyCallback) {
                _this.readyCallback();
            }
        });
    }
    Metrics.prototype.ready = function (cb) {
        this.readyCallback = cb;
    };
    Metrics.prototype.updatePlayerCounters = function (worlds, updatedCallback) {
        var _this = this;
        var config = this.config;
        var numServers = _.size(config.game_servers);
        var playerCount = _.reduce(worlds, function (sum, world) {
            return sum + world.playerCount;
        }, 0);
        if (this.isReady) {
            this.client.set("player_count_" + config.server_name, playerCount, function () {
                var totalPlayers = 0;
                _.each(config.game_servers, function (server) {
                    _this.client.get("player_count_" + server.name, function (error, result) {
                        var count = result ? parseInt(result, 10) : 0;
                        totalPlayers += count;
                        numServers -= 1;
                        if (numServers === 0) {
                            _this.client.set("total_players", totalPlayers, function () {
                                if (updatedCallback) {
                                    updatedCallback(totalPlayers);
                                }
                            });
                        }
                    });
                });
            });
        }
        else {
            throw new Error("Memcached client not connected");
        }
    };
    Metrics.prototype.updateWorldDistribution = function (worlds) {
        this.client.set("world_distribution_" + this.config.server_name, worlds);
    };
    Metrics.prototype.updateWorldCount = function () {
        this.client.set("world_count_" + this.config.server_name, this.config.nb_worlds);
    };
    Metrics.prototype.getOpenWorldCount = function (cb) {
        this.client.get("world_count_" + this.config.server_name, function (error, result) {
            cb(result);
        });
    };
    Metrics.prototype.getTotalPlayers = function (cb) {
        this.client.get("total_players", function (error, result) {
            cb(result);
        });
    };
    return Metrics;
}());
exports["default"] = Metrics;
