/* global module */

const Item = require("../../js/game/entity/objects/item.js");
const Utils = require("../../js/util/utils");
const Items = require("../../js/util/items");

class Flask extends Item {
  constructor(id, instance, x, y) {
    super(id, instance, x, y);

    const self = this;

    self.healAmount = 0;
    self.manaAmount = 0;

    const customData = Items.getCustomData(id);

    if (customData) {
      self.healAmount = customData.healAmount ? customData.healAmount : 0;
      self.manaAmount = customData.manaAmount ? customData.manaAmount : 0;
    }
  }

  onUse(character) {
    const self = this;

    if (self.healAmount) character.healHitPoints(self.healAmount);

    if (self.manaAmount) character.healManaPoints(self.manaAmount);
  }
}

module.exports = Flask;
