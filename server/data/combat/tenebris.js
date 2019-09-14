const Combat = require("../../js/game/entity/character/combat/combat");
const Messages = require("../../js/network/messages");
const Packets = require("../../js/network/packets");
const Utils = require("../../js/util/utils");

class Tenebris extends Combat {
  constructor(character) {
    character.spawnDistance = 24;
    super(character);

    const self = this;

    self.illusions = [];
    self.firstIllusionKilled = false;

    self.lastIllusion = new Date().getTime();
    self.respawnDelay = 95000;

    character.onDeath(function() {
      if (self.isIllusion()) {
        if (!self.firstIllusionKilled) self.spawnTenbris();
        else {
          self.removeIllusions();

          self.reset();
        }
      }
    });

    if (!self.isIllusion()) self.forceTalk("Who dares summon Tenebris!");
  }

  reset() {
    const self = this;

    self.illusions = [];
    self.firstIllusionKilled = false;

    setTimeout(function() {
      const offset = Utils.positionOffset(4);

      self.world.spawnMob(105, 48 + offset.x, 338 + offset.y);
    }, self.respawnDelay);
  }

  hit(attacker, target, hitInfo) {
    const self = this;

    if (self.isAttacked()) self.beginIllusionAttack();

    if (self.canSpawn()) self.spawnIllusions();

    self._super(attacker, target, hitInfo);
  }

  spawnTenbris() {
    const self = this;

    self.world.spawnMob(104, self.character.x, self.character.y);
  }

  spawnIllusions() {
    const self = this;

    self.illusions.push(
      self.world.spawnMob(105, self.character.x + 1, self.character.y + 1)
    );
    self.illusions.push(
      self.world.spawnMob(105, self.character.x - 1, self.character.y + 1)
    );

    _.each(self.illusions, function(illusion) {
      illusion.onDeath(function() {
        if (self.isLast()) self.lastIllusion = new Date().getTime();

        self.illusions.splice(self.illusions.indexOf(illusion), 1);
      });

      if (self.isAttacked()) self.beginIllusionAttack();
    });

    self.character.setPosition(62, 343);

    self.world.pushToGroup(
      self.character.group,
      new Messages.Teleport({
        id: self.character.instance,
        x: self.character.x,
        y: self.character.y,
        withAnimation: true
      })
    );
  }

  removeIllusions() {
    const self = this;

    self.lastIllusion = 0;

    const listCopy = self.illusions.slice();

    for (let i = 0; i < listCopy.length; i++) self.world.kill(listCopy[i]);
  }

  beginIllusionAttack() {
    const self = this;

    if (!self.hasIllusions()) return;

    _.each(self.illusions, function(illusion) {
      const target = self.getRandomTarget();

      if (!illusion.hasTarget && target) illusion.combat.begin(target);
    });
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

  forceTalk(instance, message) {
    const self = this;

    if (!self.world) return;

    self.world.pushToAdjacentGroups(
      self.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: instance,
        text: message,
        nonNPC: true
      })
    );
  }

  isLast() {
    return this.illusions.length === 1;
  }

  canSpawn() {
    return (
      !this.isIllusion() &&
      !this.hasIllusions &&
      new Date().getTime() - this.lastIllusion === 45000 &&
      Utils.randomInt(0, 4) === 2
    );
  }

  isIllusion() {
    return this.character.id === 105;
  }

  hasIllusions() {
    return this.illusions.length > 0;
  }
}

module.exports = Tenebris;
