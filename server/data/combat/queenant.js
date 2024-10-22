const Combat = require("../../js/game/entity/character/combat/combat");
const Packets = require("../../js/network/packets");
const Messages = require("../../js/network/messages");
const Utils = require("../../js/util/utils");
const _ = require("underscore");

class QueenAnt extends Combat {
  /*
   * The queen ant is a little more complex as it uses
   * AoE attacks and has a stun timer.
   */

  constructor(character) {
    character.spawnDistance = 18;
    super(character);

    const self = this;

    self.character = character;

    self.lastActionThreshold = 10000; // AoE Attack Threshold.

    self.aoeTimeout = null;

    self.aoeCountdown = 5;
    self.aoeRadius = 2;
    self.lastAoE = 0;

    self.minionCount = 7;
    self.lastSpawn = 0;
    self.minions = [];

    self.frozen = false;

    self.character.onDeath(function() {
      /**
       * This is to prevent the boss from dealing
       * any powerful AoE attack after dying.
       */

      self.lastSpawn = 0;

      if (self.aoeTimeout) {
        clearTimeout(self.aoeTimeout);
        self.aoeTimeout = null;
      }

      const listCopy = self.minions.slice();

      for (let i = 0; i < listCopy.length; i++) self.world.kill(listCopy[i]);
    });

    self.character.onReturn(function() {
      clearTimeout(self.aoeTimeout);
      self.aoeTimeout = null;
    });
  }

  begin(attacker) {
    const self = this;

    self.resetAoE();

    self._super(attacker);
  }

  hit(attacker, target, hitInfo) {
    const self = this;

    if (self.frozen) return;

    if (self.canCastAoE()) {
      self.doAoE();
      return;
    }

    if (self.canSpawn()) self.spawnMinions();

    if (self.isAttacked()) self.beginMinionAttack();

    self._super(attacker, target, hitInfo);
  }

  doAoE() {
    const self = this;

    /**
     * The reason this function does not use its superclass
     * representation is because of the setTimeout function
     * which does not allow us to call _super().
     */

    self.resetAoE();

    self.lastHit = self.getTime();

    self.pushFreeze(true);

    self.pushCountdown(self.aoeCountdown);

    self.aoeTimeout = setTimeout(function() {
      self.dealAoE(self.aoeRadius, true);

      self.pushFreeze(false);
    }, 5000);
  }

  spawnMinions() {
    const self = this;

    self.lastSpawn = new Date().getTime();

    for (let i = 0; i < self.minionCount; i++) {
      self.minions.push(
        self.world.spawnMob(13, self.character.x, self.character.y)
      );
    }

    _.each(self.minions, function(minion) {
      minion.aggressive = true;
      minion.spawnDistance = 12;

      minion.onDeath(function() {
        if (self.isLast()) self.lastSpawn = new Date().getTime();

        self.minions.splice(self.minions.indexOf(minion), 1);
      });

      if (self.isAttacked()) self.beginMinionAttack();
    });
  }

  beginMinionAttack() {
    const self = this;

    if (!self.hasMinions()) return;

    _.each(self.minions, function(minion) {
      const randomTarget = self.getRandomTarget();

      if (!minion.hasTarget() && randomTarget) {
        minion.combat.begin(randomTarget);
      }
    });
  }

  resetAoE() {
    this.lastAoE = new Date().getTime();
  }

  getRandomTarget() {
    const self = this;

    if (self.isAttacked()) {
      const keys = Object.keys(self.attackers);
      const randomAttacker =
        self.attackers[keys[Utils.randomInt(0, keys.length)]];

      if (randomAttacker) return randomAttacker;
    }

    if (self.character.hasTarget()) return self.character.target;

    return null;
  }

  pushFreeze(state) {
    const self = this;

    self.character.frozen = state;
    self.character.stunned = state;
  }

  pushCountdown(count) {
    const self = this;

    self.world.pushToAdjacentGroups(
      self.character.group,
      new Messages.NPC(Packets.NPCOpcode.Countdown, {
        id: self.character.instance,
        countdown: count
      })
    );
  }

  getMinions() {
    const self = this;
    const grids = self.world.getGrids();
  }

  isLast() {
    return this.minions.length === 1;
  }

  hasMinions() {
    return this.minions.length > 0;
  }

  canCastAoE() {
    return new Date().getTime() - this.lastAoE > 30000;
  }

  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 45000 &&
      !this.hasMinions() &&
      this.isAttacked()
    );
  }
}

module.exports = QueenAnt;
