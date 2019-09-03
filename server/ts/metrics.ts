import * as _ from "underscore";
import World from "./worldserver";

export default class Metrics {
  config: any;
  client: any;
  isReady: boolean;
  readyCallback: any;
  constructor(config: any) {
    this.config = config;
    this.client = new (require("memcache")).Client(
      config.memcached_port,
      config.memcached_host
    );
    this.client.connect();

    this.isReady = false;

    this.client.on("connect", () => {
      console.info(
        `Metrics enabled: memcached client connected to ${config.memcached_host}: ${config.memcached_port}`
      );
      this.isReady = true;
      if (this.readyCallback) {
        this.readyCallback();
      }
    });
  }

  ready(cb: () => void) {
    this.readyCallback = cb;
  }

  updatePlayerCounters(
    worlds: World[],
    updatedCallback: { (totalPlayers: any): void; (arg0: number): void }
  ) {
    let config = this.config;
    let numServers = _.size(config.game_servers);
    let playerCount = _.reduce(
      worlds,
      (sum, world) => {
        return sum + world.playerCount;
      },
      0
    );

    if (this.isReady) {
      // Set the number of players on this server
      this.client.set("player_count_" + config.server_name, playerCount, () => {
        let totalPlayers = 0;

        // Recalculate the total number of players and set it
        _.each(config.game_servers, (server: any) => {
          this.client.get(
            "player_count_" + server.name,
            (error: any, result: string) => {
              let count = result ? parseInt(result, 10) : 0;

              totalPlayers += count;
              numServers -= 1;
              if (numServers === 0) {
                this.client.set("total_players", totalPlayers, () => {
                  if (updatedCallback) {
                    updatedCallback(totalPlayers);
                  }
                });
              }
            }
          );
        });
      });
    } else {
      throw new Error("Memcached client not connected");
    }
  }

  updateWorldDistribution(worlds: any[]) {
    this.client.set("world_distribution_" + this.config.server_name, worlds);
  }

  updateWorldCount() {
    this.client.set(
      "world_count_" + this.config.server_name,
      this.config.nb_worlds
    );
  }

  getOpenWorldCount(cb: {
    (open_world_count: any): void;
    (arg0: any): void;
  }) {
    this.client.get(
      "world_count_" + this.config.server_name,
      (error: any, result: any) => {
        cb(result);
      }
    );
  }

  getTotalPlayers(cb: { (totalPlayers: any): void; (arg0: any): void }) {
    this.client.get("total_players", (error: any, result: any) => {
      cb(result);
    });
  }
}
