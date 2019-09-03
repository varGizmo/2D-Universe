"use strict";
exports.__esModule = true;
var _ = require("underscore");
var fs = require("fs");
var metrics_1 = require("./metrics");
var productionconfig_1 = require("./productionconfig");
var ws_1 = require("./ws");
var worldserver_1 = require("./worldserver");
var databaseselector_1 = require("./databaseselector");
var player_1 = require("./player");
function main(config) {
    var production_config = new productionconfig_1["default"](config);
    if (production_config.inProduction()) {
        _.extend(config, production_config.getProductionSettings());
    }
    var server = new ws_1["default"].WebsocketServer(config.port, config.use_one_port, config.ip);
    var metrics;
    if (config.metrics_enabled)
        metrics = new metrics_1["default"](config);
    var worlds = [];
    var lastTotalPlayers = 0;
    var checkPopulationInterval = setInterval(function () {
        if (metrics && metrics.isReady) {
            metrics.updateWorldCount();
            metrics.getTotalPlayers(function (totalPlayers) {
                if (totalPlayers !== lastTotalPlayers) {
                    lastTotalPlayers = totalPlayers;
                    _.each(worlds, function (world) {
                        world.updatePopulation(totalPlayers);
                    });
                }
            });
        }
    }, 1000);
    console.info("Starting BrowserQuest game server...");
    var selector = databaseselector_1["default"](config)["default"];
    var databaseHandler = new selector(config);
    server.onConnect(function (connection) {
        var world;
        var connect = function () {
            if (world) {
                world.connect_cb(new player_1["default"](connection, world, databaseHandler));
            }
        };
        if (metrics) {
            metrics.getOpenWorldCount(function (open_world_count) {
                world = _.min(_.first(worlds, open_world_count), function (w) {
                    return w.playerCount;
                });
                connect();
            });
        }
        else {
            world = _.find(worlds, function (world) {
                return world.playerCount < config.nb_players_per_world;
            });
            world.updatePopulation();
            connect();
        }
    });
    server.onError(function () {
        throw new Error(Array.prototype.join.call(arguments, ", "));
    });
    var onPopulationChange = function () {
        metrics.updatePlayerCounters(worlds, function (totalPlayers) {
            _.each(worlds, function (world) {
                world.updatePopulation(totalPlayers);
            });
        });
        metrics.updateWorldDistribution(getWorldDistribution(worlds));
    };
    _.each(_.range(config.nb_worlds), function (i) {
        var world = new worldserver_1["default"]("world" + (i + 1), config.nb_players_per_world, server, databaseHandler);
        world.run(config.map_filepath);
        worlds.push(world);
        if (metrics) {
            world.onPlayerAdded(onPopulationChange);
            world.onPlayerRemoved(onPopulationChange);
        }
    });
    server.onRequestStatus(function () {
        return JSON.stringify(getWorldDistribution(worlds));
    });
    if (config.metrics_enabled) {
        metrics.ready(function () {
            onPopulationChange();
        });
    }
    process.on("uncaughtException", function (e) {
        throw new Error("uncaughtException: " + e.stack);
    });
}
function getWorldDistribution(worlds) {
    var distribution = [];
    _.each(worlds, function (world) {
        distribution.push(world.playerCount);
    });
    return distribution;
}
function getConfigFile(path, cb) {
    fs.readFile(path, "utf8", function (err, json_string) {
        if (err) {
            console.info("This server can be customized by creating a configuration file named: " +
                err.path);
            cb(null);
        }
        else {
            cb(JSON.parse(json_string));
        }
    });
}
var defaultConfigPath = "./server/config.json";
var customConfigPath = "./server/config_local.json";
process.argv.forEach(function (val, index, array) {
    if (index === 2) {
        customConfigPath = val;
    }
});
getConfigFile(defaultConfigPath, function (defaultConfig) {
    getConfigFile(customConfigPath, function (localConfig) {
        if (localConfig) {
            if (defaultConfig)
                main(Object.assign(localConfig, defaultConfig));
            else
                main(localConfig);
        }
        else if (defaultConfig) {
            main(defaultConfig);
        }
        else {
            throw new Error("Server cannot start without any configuration file.");
            process.exit(1);
        }
    });
});
