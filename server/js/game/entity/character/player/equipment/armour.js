/* global module */

const Equipment = require("./equipment");
const Items = require("../../../../../util/items");
const Modules = require("../../../../../util/modules");

class Armour extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);

    this.defense = Items.getArmourLevel(name);
  }

  hasAntiStun() {
    return this.ability === 6;
  }

  setDefense(defense) {
    this.defense = defense;
  }

  getDefense() {
    return this.defense;
  }

  getType() {
    return Modules.Equipment.Armour;
  }
}

module.exports = Armour;
