/* global module */

const Quest = require("../quest");
const Packets = require("../../../../../../network/packets");
const Messages = require("../../../../../../network/messages");

class BulkySituation extends Quest {
  constructor(player, data) {
    super(player, data);

    const self = this;

    self.player = player;
    self.data = data;

    self.lastNPC = null;
  }

  load(stage) {
    const self = this;

    if (!stage) self.update();
    else self.stage = stage;

    self.loadCallbacks();
  }

  loadCallbacks() {
    const self = this;

    if (self.stage > 9999) return;

    self.onNPCTalk(function(npc) {
      if (self.hasRequirement()) {
        self.progress("item");
        return;
      }

      const conversation = self.getConversation(npc.id);

      self.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: conversation
        })
      );

      self.lastNPC = npc;

      npc.talk(conversation);

      if (npc.talkIndex > conversation.length) self.progress("talk");
    });
  }

  progress(type) {
    const self = this;
    const task = self.data.task[self.stage];

    if (!task || task !== type) return;

    if (self.stage === self.data.stages) {
      self.finish();
      return;
    }

    switch (type) {
      case "item":
        self.player.inventory.remove(self.getItem(), 1);

        break;
    }

    self.resetTalkIndex(self.lastNPC);

    self.stage++;

    self.player.send(
      new Messages.Quest(Packets.QuestOpcode.Progress, {
        id: self.id,
        stage: self.stage,
        isQuest: true
      })
    );
  }

  finish() {
    super.finish();
  }

  hasRequirement() {
    return (
      this.getTask() === "item" &&
      this.player.inventory.contains(this.getItem())
    );
  }
}

module.exports = BulkySituation;
