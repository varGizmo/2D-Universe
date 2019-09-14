const fs = require("fs");
const _ = require("underscore");
const World = require("./game/world");
const WebSocket = require("./network/websocket");
const config = require("../config");
const chalk = require("chalk");
const { ColorfulChalkLogger, INFO } = require("colorful-chalk-logger");
const Parser = require("./util/parser");
const Database = require("./database/database");

const worlds = [];
let allowConnections = false;
let worldsCreated = 0;

log = new ColorfulChalkLogger("Gizmo", { date: true });
log.notice = log.info;
log.formatHeader = function(level, date) {
  let { desc } = level;
  let { name } = this;
  if (this.flags.colorful) {
    desc = level.headerChalk.fg(desc);
    if (level.headerChalk.bg != null) desc = level.headerChalk.bg(desc);
    name = chalk.gray(name);
  }
  const header = `${desc} ${name}`;
  if (!this.flags.date) return `[${header}]`;

  let dateString = date
    .toISOString()
    .split("T")
    .join(" ")
    .split(".")[0];

  if (this.flags.colorful) dateString = chalk.gray(dateString);
  return `${desc}[${dateString}]`;
};

function main() {
  log.info("Initializing " + config.name + " game engine...");

  const webSocket = new WebSocket(config.host, config.port, config.gver);
  const database = new Database(config.database);

  webSocket.onConnect(function(connection) {
    if (allowConnections) {
      let world;

      for (let i = 0; i < worlds.length; i++) {
        if (worlds[i].playerCount < worlds[i].maxPlayers) {
          world = worlds[i];
          break;
        }
      }

      if (world) world.playerConnectCallback(connection);
      else {
        log.info("Worlds are all currently full. Closing connection.");

        connection.sendUTF8("full");
        connection.close();
      }
    } else {
      connection.sendUTF8("disallowed");
      connection.close();
    }
  });

  webSocket.onWebSocketReady(function() {
    /**
     * Initialize the worlds after the webSocket finishes.
     */

    loadParser();

    for (let i = 0; i < config.worlds; i++) {
      worlds.push(new World(i + 1, webSocket, database.getDatabase()));
    }

    initializeWorlds();
  });
}

function onWorldLoad() {
  worldsCreated++;
  if (worldsCreated === worlds.length) allWorldsCreated();
}

function allWorldsCreated() {
  log.notice(
    "Finished creating " +
      worlds.length +
      " world" +
      (worlds.length > 1 ? "s" : "") +
      "!"
  );
  allowConnections = true;

  const host = config.host === "0.0.0.0" ? "localhost" : config.host;
  log.notice("Connect locally via http://" + host + ":" + config.port);
}

function loadParser() {
  new Parser();
}

function initializeWorlds() {
  for (const worldId in worlds) {
    if (worlds.hasOwnProperty(worldId)) worlds[worldId].load(onWorldLoad);
  }
}

function getPopulations() {
  const counts = [];

  for (const index in worlds) {
    if (worlds.hasOwnProperty(index)) {
      counts.push(worlds[index].getPopulation());
    }
  }

  return counts;
}

function saveAll() {
  _.each(worlds, function(world) {
    world.saveAll();
  });

  const plural = worlds.length > 1;

  log.notice(
    "Saved players for " + worlds.length + " world" + (plural ? "s" : "") + "."
  );
}

if (typeof String.prototype.startsWith !== "function") {
  String.prototype.startsWith = function(str) {
    return str.length > 0 && this.substring(0, str.length) === str;
  };
}

if (typeof String.prototype.endsWith !== "function") {
  String.prototype.endsWith = function(str) {
    return (
      str.length > 0 &&
      this.substring(this.length - str.length, this.length) === str
    );
  };
}

main();
