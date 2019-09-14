/* global module */

const Quest = require("../quest");
const Packets = require("../../../../../network/packets");

class Thelie extends Quest {
  constructor(player, data) {
    super(player, data);

    const self = this;

    self.player = player;
    self.data = data;
  }

  load(stage) {
    const self = this;

    if (stage) self.update();
    else self.stage = stage;
  }

  update() {
    this.player.save();
  }
}

module.exports = Thelie;
