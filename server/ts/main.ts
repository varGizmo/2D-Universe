import * as _ from "underscore";
import * as fs from "fs";
import Metrics from "./metrics";
import ProductionConfig from "./productionconfig";
import ws from "./ws";
import WorldServer from "./worldserver";
import DatabaseSelector from "./databaseselector";
import Player from "./player";

function main(config: any) {
  let production_config = new ProductionConfig(config);
  if (production_config.inProduction()) {
    _.extend(config, production_config.getProductionSettings());
  }

  let server = new ws.WebsocketServer(
    config.port,
    config.use_one_port,
    config.ip
  );
  let metrics: any;
  if (config.metrics_enabled) metrics = new Metrics(config);
  let worlds: any[] = [];
  let lastTotalPlayers = 0;
  let checkPopulationInterval = setInterval(() => {
    if (metrics && metrics.isReady) {
      metrics.updateWorldCount();
      metrics.getTotalPlayers((totalPlayers: number) => {
        if (totalPlayers !== lastTotalPlayers) {
          lastTotalPlayers = totalPlayers;
          _.each(worlds, world => {
            world.updatePopulation(totalPlayers);
          });
        }
      });
    }
  }, 1000);

  console.info("Starting BrowserQuest game server...");
  let selector = DatabaseSelector(config).default;
  let databaseHandler = new selector(config);

  server.onConnect((connection: any) => {
    let world: WorldServer; // the one in which the player will be spawned
    let connect = () => {
      if (world) {
        world.connect_cb(new Player(connection, world, databaseHandler));
      }
    };

    if (metrics) {
      metrics.getOpenWorldCount((open_world_count: number) => {
        // choose the least populated world among open worlds
        world = _.min(_.first(worlds, open_world_count), w => {
          return w.playerCount;
        });
        connect();
      });
    } else {
      // simply fill each world sequentially until they are full
      world = _.find(worlds, world => {
        return world.playerCount < config.nb_players_per_world;
      });
      world.updatePopulation();
      connect();
    }
  });

  server.onError(function() {
    throw new Error(Array.prototype.join.call(arguments, ", "));
  });

  let onPopulationChange = () => {
    metrics.updatePlayerCounters(worlds, (totalPlayers: number) => {
      _.each(worlds, world => {
        world.updatePopulation(totalPlayers);
      });
    });
    metrics.updateWorldDistribution(getWorldDistribution(worlds));
  };

  _.each(_.range(config.nb_worlds), i => {
    let world = new WorldServer(
      "world" + (i + 1),
      config.nb_players_per_world,
      server,
      databaseHandler
    );
    world.run(config.map_filepath);
    worlds.push(world);
    if (metrics) {
      world.onPlayerAdded(onPopulationChange);
      world.onPlayerRemoved(onPopulationChange);
    }
  });

  server.onRequestStatus(() => {
    return JSON.stringify(getWorldDistribution(worlds));
  });

  if (config.metrics_enabled) {
    metrics.ready(() => {
      onPopulationChange(); // initialize all counters to 0 when the server starts
    });
  }

  process.on("uncaughtException", e => {
    // Display the full error stack, to aid debugging
    throw new Error("uncaughtException: " + e.stack);
  });
}

function getWorldDistribution(worlds: WorldServer[]) {
  let distribution: number[] = [];

  _.each(worlds, world => {
    distribution.push(world.playerCount);
  });
  return distribution;
}

function getConfigFile(path: string, cb: Function) {
  fs.readFile(path, "utf8", (err, json_string) => {
    if (err) {
      console.info(
        "This server can be customized by creating a configuration file named: " +
          err.path
      );
      cb(null);
    } else {
      cb(JSON.parse(json_string));
    }
  });
}

let defaultConfigPath = "./server/config.json";
let customConfigPath = "./server/config_local.json";

process.argv.forEach((val, index, array) => {
  if (index === 2) {
    customConfigPath = val;
  }
});

getConfigFile(defaultConfigPath, (defaultConfig: any) => {
  getConfigFile(customConfigPath, (localConfig: any) => {
    if (localConfig) {
      if (defaultConfig) main(Object.assign(localConfig, defaultConfig));
      else main(localConfig);
    } else if (defaultConfig) {
      main(defaultConfig);
    } else {
      throw new Error("Server cannot start without any configuration file.");
      process.exit(1);
    }
  });
});
