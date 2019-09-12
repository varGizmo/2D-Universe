/* global module */

let Entity = require("../entity");

class NPC extends Entity {
  constructor(id, instance, x, y) {
    super(id, "npc", instance, x, y);

    this.talkIndex = 0;
  }

  talk(messages) {
    let self = this;

    if (self.talkIndex > messages.length) self.talkIndex = 0;

    self.talkIndex++;
  }
}

module.exports = NPC;
