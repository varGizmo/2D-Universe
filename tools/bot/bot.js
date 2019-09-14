const cls = require("../../server/js/lib/class");
const Player = require("../../server/js/game/entity/character/player/player");
const Creator = require("../../server/js/database/creator");
const Utils = require("../../server/js/util/utils");
const _ = require("underscore");

module.exports = Bot = cls.Class.extend({
  init: function(world, count) {
    const self = this;

    self.world = world;
    self.count = count;

    self.creator = new Creator(null);

    self.players = [];

    self.load();
  },

  load: function() {
    const self = this;

    for (let i = 0; i < self.count; i++) {
      const connection = {
        id: i,
        listen: function() {},
        onClose: function() {}
      };
      const player = new Player(self.world, self.world.database, connection, -1);

      self.world.addPlayer(player);

      player.username = "Bot" + i;

      player.load(self.creator.getPlayerData(player));

      player.intro();

      player.walkRandomly();

      self.players.push(player);
    }
  }
});
