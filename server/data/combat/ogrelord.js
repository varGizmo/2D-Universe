const Combat = require("../../js/game/entity/character/combat/combat");
const Messages = require("../../js/network/messages");
const Packets = require("../../js/network/packets");
const Modules = require("../../js/util/modules");
const Utils = require("../../js/util/utils");
const _ = require("underscore");

class OgreLord extends Combat {
  constructor(character) {
    super(character);

    const self = this;

    self.character = character;

    self.dialogues = [
      "Get outta my swamp",
      "No, not the onion.",
      "My minions give me strength! You stand no chance!"
    ];

    self.minions = [];

    self.lastSpawn = 0;

    self.loaded = false;

    character.projectile = Modules.Projectiles.Boulder;
    character.projectileName = "projectile-boulder";

    character.onDeath(function() {
      self.reset();
    });
  }

  load() {
    const self = this;

    self.talkingInterval = setInterval(function() {
      if (self.character.hasTarget()) self.forceTalk(self.getMessage());
    }, 9000);

    self.updateInterval = setInterval(function() {
      self.character.armourLevel = 50 + self.minions.length * 15;
    }, 2000);

    self.loaded = true;
  }

  hit(character, target, hitInfo) {
    const self = this;

    if (self.isAttacked()) self.beginMinionAttack();

    if (!character.isNonDiagonal(target)) {
      const distance = character.getDistance(target);

      if (distance < 7) {
        hitInfo.isRanged = true;
        character.attackRange = 7;
      }
    }

    if (self.canSpawn()) self.spawnMinions();

    self._super(character, target, hitInfo);
  }

  forceTalk(message) {
    const self = this;

    if (!self.world) return;

    self.world.pushToAdjacentGroups(
      self.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: self.character.instance,
        text: message,
        nonNPC: true
      })
    );
  }

  getMessage() {
    return this.dialogues[Utils.randomInt(0, this.dialogues.length - 1)];
  }

  spawnMinions() {
    const self = this;
    const xs = [414, 430, 415, 420, 429];
    const ys = [172, 173, 183, 185, 180];

    self.lastSpawn = new Date().getTime();

    self.forceTalk("Now you shall see my true power!");

    for (let i = 0; i < xs.length; i++) {
      self.minions.push(self.world.spawnMob(12, xs[i], ys[i]));
    }

    _.each(self.minions, function(minion) {
      minion.onDeath(function() {
        if (self.isLast()) self.lastSpawn = new Date().getTime();

        self.minions.splice(self.minions.indexOf(minion), 1);
      });

      if (self.isAttacked()) self.beginMinionAttack();
    });

    if (!self.loaded) self.load();
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

  reset() {
    const self = this;

    self.lastSpawn = 0;

    const listCopy = self.minions.slice();

    for (let i = 0; i < listCopy.length; i++) self.world.kill(listCopy[i]);

    clearInterval(self.talkingInterval);
    clearInterval(self.updateInterval);

    self.talkingInterval = null;
    self.updateInterval = null;

    self.loaded = false;
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

  hasMinions() {
    return this.minions.length > 0;
  }

  isLast() {
    return this.minions.length === 1;
  }

  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 50000 &&
      !this.hasMinions() &&
      this.isAttacked()
    );
  }
}

module.exports = OgreLord;
