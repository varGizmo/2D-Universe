/* global module */

const Data = require("../../../../../data/achievements");
const Messages = require("../../../../network/messages");
const Packets = require("../../../../network/packets");
const Modules = require("../../../../util/modules");

class Achievement {
  constructor(id, player) {
    const self = this;

    self.id = id;
    self.player = player;

    self.progress = 0;

    self.data = Data[self.id];

    self.name = self.data.name;
    self.description = self.data.description;

    self.discovered = false;
  }

  step() {
    const self = this;

    if (self.isThreshold()) return;

    self.progress++;

    self.update();

    self.player.send(
      new Messages.Quest(Packets.QuestOpcode.Progress, {
        id: self.id,
        name: self.name,
        progress: self.progress - 1,
        count: self.data.count,
        isQuest: false
      })
    );
  }

  converse(npc) {
    const self = this;

    if (self.isThreshold() || self.hasItem()) self.finish(npc);
    else {
      npc.talk(self.data.text);

      self.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: self.data.text
        })
      );

      if (!self.isStarted() && npc.talkIndex > self.data.text.length) {
        self.step();
      }
    }
  }

  finish(npc) {
    const self = this;
    const rewardType = self.data.rewardType;

    switch (rewardType) {
      case Modules.Achievements.Rewards.Item:
        if (!self.player.inventory.hasSpace()) {
          self.player.notify(
            "You do not have enough space in your inventory to finish this achievement."
          );
          return;
        }

        self.player.inventory.add({
          id: self.data.item,
          count: self.data.itemCount
        });

        break;

      case Modules.Achievements.Rewards.Experience:
        self.player.addExperience(self.data.reward);

        break;
    }

    self.setProgress(9999);
    self.update();

    self.player.send(
      new Messages.Quest(Packets.QuestOpcode.Finish, {
        id: self.id,
        name: self.name,
        isQuest: false
      })
    );

    if (npc && self.player.npcTalkCallback) self.player.npcTalkCallback(npc);
  }

  update() {
    this.player.save();
  }

  isThreshold() {
    return this.progress >= this.data.count;
  }

  hasItem() {
    const self = this;

    if (
      self.data.type === Modules.Achievements.Type.Scavenge &&
      self.player.inventory.contains(self.data.item)
    ) {
      self.player.inventory.remove(self.data.item, self.data.itemCount);

      return true;
    }

    return false;
  }

  setProgress(progress) {
    this.progress = progress;
  }

  isStarted() {
    return this.progress > 0;
  }

  isFinished() {
    return this.progress > 9998;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.data.type,
      description: this.description,
      count: this.data.count ? this.data.count : 1,
      progress: this.progress,
      finished: this.isFinished()
    };
  }
}

module.exports = Achievement;
