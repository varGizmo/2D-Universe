/* global module */

let Messages = require("../../../../../network/messages"),
  Packets = require("../../../../../network/packets"),
  Utils = require("../../../../../util/utils");

class Quest {
  constructor(player, data) {
    let self = this;

    self.player = player;
    self.data = data;

    self.id = data.id;
    self.name = data.name;
    self.description = data.description;

    self.stage = 0;
    self.subStage = {};
  }

  finish() {
    let self = this;

    if (self.hasItemReward()) {
      let item = self.getItemReward();

      if (item) {
        if (self.hasInventorySpace(item.id, item.count))
          self.player.inventory.add(item.id, item.count);
        else {
          self.player.notify("You do not have enough space in your inventory.");
          self.player.notify("Please make room prior to finishing the quest.");

          return;
        }
      }
    }

    self.setStage(9999);

    self.player.send(
      new Messages.Quest(Packets.QuestOpcode.Finish, {
        id: self.id,
        isQuest: true
      })
    );
  }

  setStage(stage) {
    let self = this;

    self.stage = stage;
    self.update();
  }

  triggerTalk(npc) {
    let self = this;

    if (self.npcTalkCallback) self.npcTalkCallback(npc);
  }

  update() {
    return this.player.save();
  }

  getConversation(id) {
    let self = this,
      conversation = self.data.conversations[id];

    if (!conversation || !conversation[self.stage]) return [""];

    return conversation[self.stage];
  }

  updatePointers() {
    let self = this;

    if (!self.data.pointers) return;

    let pointer = self.data.pointers[self.stage];

    if (!pointer) return;

    let opcode = pointer[0],
      x = pointer[1],
      y = pointer[2];

    self.player.send(
      new Messages.Pointer(opcode, {
        id: Utils.generateRandomId(),
        x: x,
        y: y
      })
    );
  }

  forceTalk(npc, message) {
    let self = this;

    if (!npc) return;

    npc.talkIndex = 0;

    self.player.send(
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: npc.instance,
        text: message
      })
    );
  }

  resetTalkIndex(npc) {
    let self = this;

    /**
     * Ensures that an NPC does not go off the conversation
     * index and is resetted in order to start a new chat
     */

    if (!npc) return;

    npc.talkIndex = 0;

    self.player.send(
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: npc.instance,
        text: null
      })
    );
  }

  addSubStage(key, value) {
    this.subStage[key] = value;
  }

  clearPointers() {
    this.player.send(new Messages.Pointer(Packets.PointerOpcode.Remove, {}));
  }

  onNPCTalk(callback) {
    this.npcTalkCallback = callback;
  }

  static hasMob() {
    return false;
  }

  hasNPC(id) {
    return this.data.npcs.indexOf(id) > -1;
  }

  hasItemReward() {
    return !!this.data.itemReward;
  }

  hasInventorySpace(id, count) {
    return this.player.inventory.canHold(id, count);
  }

  hasDoorUnlocked(door) {
    return false;
  }

  isFinished() {
    return this.stage > 9998;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getTask() {
    return this.data.task[this.stage];
  }

  getItem() {
    return this.data.itemReq ? this.data.itemReq[this.stage] : null;
  }

  getStage() {
    return this.stage;
  }

  getSubStage(key) {
    return this.subStage[key];
  }

  getItemReward() {
    return this.hasItemReward() ? this.data.itemReward : null;
  }

  getDescription() {
    return this.description;
  }

  getInfo() {
    return {
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      stage: this.getStage(),
      finished: this.isFinished()
    };
  }
}

module.exports = Quest;
