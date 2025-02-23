/* global module */

const path = require("path");
const _ = require("underscore");
const NPCData = require("../../data/npcs");
const ItemData = require("../../data/items");
const MobData = require("../../data/mobs");
const AbilityData = require("../../data/abilities");
const ShopsData = require("../../data/shops");
const Mobs = require("./mobs");
const NPCs = require("./npcs");
const Items = require("./items");
const Abilities = require("./abilities");
const Shops = require("./shops");
const Formulas = require("./formulas");
const Constants = require("./constants");

class Parser {
  constructor() {
    const self = this;

    self.loadMobData();
    self.loadNPCData();
    self.loadItemData();
    self.loadAbilityData();
    self.loadShops();
    self.loadLevels();
  }

  loadMobData() {
    let mobCounter = 0;

    _.each(MobData, function(value, key) {
      key = key.toLowerCase();

      Mobs.Properties[key] = {
        key: key,
        id: value.id,
        name: value.name ? value.name : key,
        drops: value.drops ? value.drops : null,
        hitPoints: value.hitPoints ? value.hitPoints : 10,
        armour: value.armour ? value.armour : 0,
        weapon: value.weapon ? value.weapon : 0,
        xp: value.xp ? value.xp : 0,
        level: value.level ? value.level : 0,
        aggroRange: value.aggroRange ? value.aggroRange : 2,
        attackRange: value.attackRange ? value.attackRange : 1,
        aggressive: value.aggressive ? value.aggressive : false,
        isPoisonous: value.isPoisonous ? value.isPoisonous : false,
        attackRate: value.attackRate ? value.attackRate : 1000,
        movementSpeed: value.movementSpeed ? value.movementSpeed : 200,
        projectileName: value.projectileName ? value.projectileName : null,
        spawnDelay: value.spawnDelay ? value.spawnDelay : 60000,
        combatPlugin: value.combatPlugin ? value.combatPlugin : null,
        hiddenName: value.hiddenName ? value.hiddenName : false
      };

      Mobs.Ids[value.id] = Mobs.Properties[key];

      mobCounter++;
    });

    Mobs.Plugins = require("../util/plugins")(
      path.join(__dirname, "/../../data/combat/")
    );

    log.info("Finished loading " + mobCounter + " mobs.");
    log.info("Loaded " + Object.keys(Mobs.Plugins).length + " combat plugins.");
  }

  loadNPCData() {
    let npcCounter = 0;

    _.each(NPCData, function(value, key) {
      key = key.toLowerCase();

      NPCs.Properties[key] = {
        key: key,
        id: value.id,
        name: value.name ? value.name : key,
        text: value.text ? value.text : null,
        type: value.type ? value.type : null
      };

      NPCs.Ids[value.id] = NPCs.Properties[key];

      npcCounter++;
    });

    log.info("Finished loading " + npcCounter + " NPCs.");
  }

  loadItemData() {
    let itemCounter = 0;

    _.each(ItemData, function(value, key) {
      key = key.toLowerCase();

      Items.Data[key] = {
        key: key,
        id: value.id ? value.id : -1,
        type: value.type ? value.type : "object",
        attack: value.attack ? value.attack : 0,
        defense: value.defense ? value.defense : 0,
        pendantLevel: value.pendantLevel ? value.pendantLevel : null,
        ringLevel: value.ringLevel ? value.ringLevel : null,
        bootsLevel: value.bootsLevel ? value.bootsLevel : null,
        name: value.name ? value.name : key,
        price: value.price ? value.price : 1,
        storeCount: value.storeCount ? value.storeCount : 1,
        stackable: value.stackable ? value.stackable : 0,
        edible: value.edible ? value.edible : 0,
        healsHealth: value.healsHealth ? value.healsHealth : 0,
        healsMana: value.healsMana ? value.healsMana : 0,
        maxStackSize: value.maxStackSize ? value.maxStackSize : -1,
        plugin: value.plugin ? value.plugin : null,
        customData: value.customData ? value.customData : null,
        requirement: value.requirement ? value.requirement : null
      };

      Items.Ids[value.id] = Items.Data[key];

      itemCounter++;
    });

    Items.Plugins = require("../util/plugins")(
      path.join(__dirname, "/../../data/items/")
    );

    log.info("Finished loading " + itemCounter + " items.");
    log.info("Loaded " + Object.keys(Items.Plugins).length + " item plugins.");
  }

  loadAbilityData() {
    let skillCounter = 0;

    _.each(AbilityData, function(value, key) {
      key = key.toLowerCase();

      Abilities.Data[key] = {
        key: key,
        id: value.id,
        type: value.type,
        mana: value.mana ? value.mana : 0,
        cooldown: value.cooldown ? value.cooldown : null
      };

      Abilities.Ids[value.id] = Abilities.Data[key];

      skillCounter++;
    });

    log.info("Finished loading " + skillCounter + " skills.");
  }

  loadShops() {
    let shopCounter = 0;

    _.each(ShopsData, function(value, key) {
      key = key.toLowerCase();

      Shops.Data[key] = {
        key: key,
        id: value.npcId,
        items: value.items,
        count: value.count,
        originalCount: value.count,
        prices: value.prices,
        currency: value.currency,
        stockDuration: value.stockDuration
      };

      Shops.Ids[value.npcId] = Shops.Data[key];

      shopCounter++;
    });

    log.info("Finished loading " + shopCounter + " shops.");
  }

  loadLevels() {
    Formulas.LevelExp[0] = 0;

    for (let i = 1; i < Constants.MAX_LEVEL; i++) {
      const points = Math.floor(
        0.25 * Math.floor(i + 300 * Math.pow(2, i / 7))
      );
      Formulas.LevelExp[i] = points + Formulas.LevelExp[i - 1];
    }
  }
}

module.exports = Parser;
