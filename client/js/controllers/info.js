/* global _, Modules */

define(["../utils/queue", "../renderer/infos/splat"], function(Queue, Splat) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;

      self.infos = {};
      self.destroyQueue = new Queue();
    },

    create(type, data, x, y) {
      const self = this;

      switch (type) {
        case Modules.Hits.Damage:
        case Modules.Hits.Stun:
        case Modules.Hits.Critical:
          let damage = data.shift();
          const isTarget = data.shift();
          const dId = self.generateId(self.game.time, damage, x, y);

          if (damage < 1 || !isInt(damage)) damage = "MISS";

          const hitSplat = new Splat(dId, type, damage, x, y, false);
          const dColour = isTarget
            ? Modules.DamageColours.received
            : Modules.DamageColours.inflicted;

          hitSplat.setColours(dColour.fill, dColour.stroke);

          self.addInfo(hitSplat);

          break;

        case Modules.Hits.Heal:
        case Modules.Hits.Mana:
        case Modules.Hits.Experience:
          const amount = data.shift();
          const id = self.generateId(self.game.time, amount, x, y);
          let text = "+";
          let colour;

          if (amount < 1 || !isInt(amount)) return;

          if (type !== Modules.Hits.Experience) text = "++";

          const splat = new Splat(id, type, text + amount, x, y, false);

          if (type === Modules.Hits.Heal) colour = Modules.DamageColours.healed;
          else if (type === Modules.Hits.Mana)
          { colour = Modules.DamageColours.mana; }
          else if (type === Modules.Hits.Experience)
          { colour = Modules.DamageColours.exp; }

          splat.setColours(colour.fill, colour.stroke);

          self.addInfo(splat);

          break;

        case Modules.Hits.LevelUp:
          const lId = self.generateId(self.game.time, "-1", x, y);
          const levelSplat = new Splat(lId, type, "Level Up!", x, y, false);
          const lColour = Modules.DamageColours.exp;

          levelSplat.setColours(lColour.fill, lColour.stroke);

          self.addInfo(levelSplat);

          break;
      }
    },

    getCount() {
      return Object.keys(this.infos).length;
    },

    addInfo(info) {
      const self = this;

      self.infos[info.id] = info;

      info.onDestroy(function(id) {
        self.destroyQueue.add(id);
      });
    },

    update(time) {
      const self = this;

      self.forEachInfo(function(info) {
        info.update(time);
      });

      self.destroyQueue.forEachQueue(function(id) {
        delete self.infos[id];
      });

      self.destroyQueue.reset();
    },

    forEachInfo(callback) {
      _.each(this.infos, function(info) {
        callback(info);
      });
    },

    generateId(time, info, x, y) {
      return time + "" + Math.abs(info) + "" + x + "" + y;
    }
  });
});
