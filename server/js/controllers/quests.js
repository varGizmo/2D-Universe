/* global module */

const _ = require("underscore");
const Introduction = require("../game/entity/character/player/quest/impl/introduction");
const BulkySituation = require("../game/entity/character/player/quest/impl/bulkysituation");
const QuestData = require("../../data/quests.json");
const AchievementData = require("../../data/achievements.json");
const Achievement = require("../game/entity/character/player/achievement");

class Quests {
  constructor(player) {
    const self = this;

    self.player = player;

    self.quests = {};
    self.achievements = {};

    self.load();
  }

  load() {
    const self = this;
    let questCount = 0;

    _.each(QuestData, function(quest) {
      if (questCount === 0) {
        self.quests[quest.id] = new Introduction(self.player, quest);
      } else if (questCount === 1) {
        self.quests[quest.id] = new BulkySituation(self.player, quest);
      }

      questCount++;
    });

    _.each(AchievementData, function(achievement) {
      self.achievements[achievement.id] = new Achievement(
        achievement.id,
        self.player
      );
    });
  }

  updateQuests(ids, stages) {
    const self = this;

    if (!ids || !stages) {
      _.each(self.quests, function(quest) {
        quest.load(0);
      });
      return;
    }

    for (let id = 0; id < ids.length; id++) {
      if (!isNaN(parseInt(ids[id])) && self.quests[id]) {
        self.quests[id].load(stages[id]);
      }
    }
  }

  updateAchievements(ids, progress) {
    const self = this;

    for (let id = 0; id < ids.length; id++) {
      if (!isNaN(parseInt(ids[id])) && self.achievements[id]) {
        self.achievements[id].setProgress(progress[id]);
      }
    }

    if (self.readyCallback) self.readyCallback();
  }

  getQuest(id) {
    const self = this;

    if (id in self.quests) return self.quests[id];

    return null;
  }

  getQuests() {
    const self = this;
    let ids = "";
    let stages = "";

    for (let id = 0; id < self.getQuestSize(); id++) {
      ids += id + " ";
      stages += self.quests[id].stage + " ";
    }

    return {
      username: self.player.username,
      ids: ids,
      stages: stages
    };
  }

  getAchievements() {
    const self = this;
    let ids = "";
    let progress = "";

    for (let id = 0; id < self.getAchievementSize(); id++) {
      ids += id + " ";
      progress += self.achievements[id].progress + " ";
    }

    return {
      username: self.player.username,
      ids: ids,
      progress: progress
    };
  }

  getData() {
    const self = this;
    const quests = [];
    const achievements = [];

    self.forEachQuest(function(quest) {
      quests.push(quest.getInfo());
    });

    self.forEachAchievement(function(achievement) {
      achievements.push(achievement.getInfo());
    });

    return {
      quests: quests,
      achievements: achievements
    };
  }

  forEachQuest(callback) {
    _.each(this.quests, function(quest) {
      callback(quest);
    });
  }

  forEachAchievement(callback) {
    _.each(this.achievements, function(achievement) {
      callback(achievement);
    });
  }

  getQuestsCompleted() {
    const self = this;
    let count = 0;

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        if (self.quests[id].isFinished()) count++;
      }
    }

    return count;
  }

  getAchievementsCompleted() {
    const self = this;
    let count = 0;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (self.achievements[id].isFinished()) count++;
      }
    }

    return count;
  }

  getQuestSize() {
    return Object.keys(this.quests).length;
  }

  getAchievementSize() {
    return Object.keys(this.achievements).length;
  }

  getQuestByNPC(npc) {
    const self = this;

    /**
     * Iterate through the quest list in the order it has been
     * added so that NPC's that are required by multiple quests
     * follow the proper order.
     */

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (quest.hasNPC(npc.id)) return quest;
      }
    }

    return null;
  }

  getAchievementByNPC(npc) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.npc === npc.id &&
          !self.achievements[id].isFinished()
        ) {
          return self.achievements[id];
        }
      }
    }

    return null;
  }

  getAchievementByMob(mob) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (self.achievements[id].data.mob === mob.id) {
          return self.achievements[id];
        }
      }
    }

    return null;
  }

  isQuestMob(mob) {
    const self = this;

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (!quest.isFinished() && quest.hasMob(mob.id)) return true;
      }
    }
  }

  isAchievementMob(mob) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.mob === mob.id &&
          !self.achievements[id].isFinished()
        ) {
          return true;
        }
      }
    }

    return false;
  }

  isQuestNPC(npc) {
    const self = this;

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (!quest.isFinished() && quest.hasNPC(npc.id)) return true;
      }
    }
  }

  isAchievementNPC(npc) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.npc === npc.id &&
          !self.achievements[id].isFinished()
        ) {
          return true;
        }
      }
    }

    return false;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}

module.exports = Quests;
