/* global module */

const _ = require("underscore");
const DoorData = require("../../../../../data/doors");
const Messages = require("../../../../network/messages");
const Packets = require("../../../../network/packets");

class Doors {
  constructor(player) {
    const self = this;

    self.world = player.world;
    self.player = player;

    self.doors = {};

    self.load();
  }

  load() {
    const self = this;

    _.each(DoorData, function(door) {
      self.doors[door.id] = {
        id: door.id,
        x: door.x,
        y: door.y,
        status: door.status,
        requirement: door.requirement,
        questId: door.questId,
        closedIds: door.closedIds,
        openIds: door.openIds
      };
    });
  }

  getStatus(door) {
    const self = this;

    switch (door.requirement) {
      case "quest": {
        const quest = self.player.quests.getQuest(door.questId);

        return quest && quest.hasDoorUnlocked(door) ? "open" : "closed";
      }
    }
  }

  getTiles(door) {
    const self = this;
    const tiles = {
      indexes: [],
      data: [],
      collisions: []
    };

    const status = self.getStatus(door);
    const doorState = {
      open: door.openIds,
      closed: door.closedIds
    };

    _.each(doorState[status], function(value, key) {
      tiles.indexes.push(parseInt(key));
      tiles.data.push(value.data);
      tiles.collisions.push(value.isColliding);
    });

    return tiles;
  }

  getAllTiles() {
    const self = this;
    const allTiles = {
      indexes: [],
      data: [],
      collisions: []
    };

    _.each(self.doors, function(door) {
      const tiles = self.getTiles(door);

      allTiles.indexes.push.apply(allTiles.indexes, tiles.indexes);
      allTiles.data.push.apply(allTiles.data, tiles.data);
      allTiles.collisions.push.apply(allTiles.collisions, tiles.collisions);
    });

    return allTiles;
  }

  hasCollision(x, y) {
    const self = this;
    const tiles = self.getAllTiles();
    const tileIndex = self.world.map.gridPositionToIndex(x, y);
    const index = tiles.indexes.indexOf(tileIndex) - 1;

    return index < 0 ? false : tiles.collisions[index];
  }

  getDoor(x, y, callback) {
    this.forEachDoor(function(door) {
      callback(door.x === x && door.y === y ? door : null);
    });
  }

  isDoor(x, y, callback) {
    this.forEachDoor(function(door) {
      callback(door.x === x && door.y === y);
    });
  }

  forEachDoor(callback) {
    _.each(this.doors, function(door) {
      callback(door);
    });
  }
}

module.exports = Doors;
