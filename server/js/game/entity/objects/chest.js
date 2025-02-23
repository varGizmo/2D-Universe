/* global module */

const Entity = require("../entity");
const Utils = require("../../../util/utils");

class Chest extends Entity {
  constructor(id, instance, x, y) {
    super(id, "chest", instance, x, y);

    const self = this;

    self.respawnDuration = 25000;
    self.static = false;

    self.items = [];
  }

  openChest() {
    const self = this;

    if (self.openCallback) self.openCallback();
  }

  respawn() {
    const self = this;

    setTimeout(function() {
      if (self.respawnCallback) self.respawnCallback();
    }, self.respawnDuration);
  }

  getItem() {
    const self = this;
    const random = Utils.randomInt(0, self.items.length - 1);
    const item = self.items[random];

    /**
     * We must ensure an item is always present in order
     * to avoid any unforeseen circumstances.
     */
    if (!item) return;

    return item;
  }

  onOpen(callback) {
    this.openCallback = callback;
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }
}

module.exports = Chest;
