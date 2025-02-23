/* global module */

const _ = require("underscore");
const Character = require("../character");
const Mobs = require("../../../../util/mobs");
const Utils = require("../../../../util/utils");
const Items = require("../../../../util/items");

class Mob extends Character {
  constructor(id, instance, x, y) {
    super(id, "mob", instance, x, y);

    const self = this;

    if (!Mobs.exists(id)) return;

    self.data = Mobs.Ids[self.id];
    self.hitPoints = self.data.hitPoints;
    self.maxHitPoints = self.data.hitPoints;
    self.drops = self.data.drops;

    self.respawnDelay = self.data.spawnDelay;

    self.level = self.data.level;

    self.armourLevel = self.data.armour;
    self.weaponLevel = self.data.weapon;
    self.attackRange = self.data.attackRange;
    self.aggroRange = self.data.aggroRange;
    self.aggressive = self.data.aggressive;

    self.spawnLocation = [x, y];

    self.dead = false;
    self.boss = false;
    self.static = false;
    self.hiddenName = false;

    self.projectileName = self.getProjectileName();
  }

  refresh() {
    const self = this;

    self.hitPoints = self.data.hitPoints;
    self.maxHitPoints = self.data.hitPoints;

    if (self.refreshCallback) self.refreshCallback();
  }

  getDrop() {
    const self = this;

    if (!self.drops) return null;

    let min = 0;
    let percent = 0;
    const random = Utils.randomInt(0, 1000);

    for (const drop in self.drops) {
      if (self.drops.hasOwnProperty(drop)) {
        const chance = self.drops[drop];

        min = percent;
        percent += chance;

        if (random >= min && random < percent) {
          let count = 1;

          if (drop === "gold") {
            count = Utils.randomInt(
              1,
              self.level *
                Math.floor(Math.pow(2, self.level / 7) / (self.level / 4))
            );
          }

          return {
            id: Items.stringToId(drop),
            count: count
          };
        }
      }
    }

    return null;
  }

  getProjectileName() {
    return this.data.projectileName
      ? this.data.projectileName
      : "projectile-pinearrow";
  }

  canAggro(player) {
    const self = this;

    if (
      self.hasTarget() ||
      !self.aggressive ||
      Math.floor(self.level * 1.5) < player.level ||
      !player.hasAggressionTimer()
    ) {
      return false;
    }

    return self.isNear(player, self.aggroRange);
  }

  destroy() {
    const self = this;

    self.dead = true;
    self.clearTarget();
    self.resetPosition();
    self.respawn();

    if (self.area) self.area.removeEntity(self);
  }

  return() {
    const self = this;

    self.clearTarget();
    self.resetPosition();
    self.move(self.x, self.y);
  }

  isRanged() {
    return this.attackRange > 1;
  }

  distanceToSpawn() {
    return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
  }

  isAtSpawn() {
    return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
  }

  isOutsideSpawn() {
    return this.distanceToSpawn() > this.spawnDistance;
  }

  addToChestArea(chestAreas) {
    const self = this;
    const area = _.find(chestAreas, function(area) {
      return area.contains(self.x, self.y);
    });

    if (area) area.addEntity(self);
  }

  respawn() {
    const self = this;

    /**
     * Some entities are static (only spawned once during an event)
     * Meanwhile, other entities act as an illusion to another entity,
     * so the resawning script is handled elsewhere.
     */

    if (!self.static || self.respawnDelay === -1) return;

    setTimeout(function() {
      if (self.respawnCallback) self.respawnCallback();
    }, self.respawnDelay);
  }

  getState() {
    const self = this;
    const base = super.getState();

    base.hitPoints = self.hitPoints;
    base.maxHitPoints = self.maxHitPoints;
    base.attackRange = self.attackRange;
    base.level = self.level;
    base.hiddenName = self.hiddenName;

    return base;
  }

  resetPosition() {
    const self = this;

    self.setPosition(self.spawnLocation[0], self.spawnLocation[1]);
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }

  onMove(callback) {
    this.moveCallback = callback;
  }

  onReturn(callback) {
    this.returnCallback = callback;
  }

  onRefresh(callback) {
    this.refreshCallback = callback;
  }

  onDeath(callback) {
    this.deathCallback = callback;
  }

  move(x, y) {
    const self = this;

    self.setPosition(x, y);

    if (self.moveCallback) self.moveCallback(self);
  }
}

module.exports = Mob;
