define(["jquery", "../page"], function($, Page) {
  return Page.extend({
    init() {
      const self = this;

      self._super("#questPage");

      self.achievements = $("#achievementList");
      self.quests = $("#questList");

      self.achievementsCount = $("#achievementCount");
      self.questCount = $("#questCount");

      self.achievementsList = self.achievements.find("ul");
      self.questList = self.quests.find("ul");
    },

    load(quests, achievements) {
      const self = this;
      let finishedAchievements = 0;
      let finishedQuests = 0;

      if (achievements) {
        _.each(achievements, function(achievement) {
          const item = self.getItem(false, achievement.id);
          const name = self.getName(false, achievement.id);

          name.text("????????");

          name.css("background", "rgba(255, 10, 10, 0.3)");

          if (achievement.progress > 0 && achievement.progress < 9999) {
            name.css("background", "rgba(255, 255, 10, 0.4)");

            name.text(
              achievement.name +
                (achievement.count > 2
                  ? " " +
                    (achievement.progress - 1) +
                    "/" +
                    (achievement.count - 1)
                  : "")
            );
          } else if (achievement.progress > 9998) {
            name.text(achievement.name);
            name.css("background", "rgba(10, 255, 10, 0.3)");
          }

          if (achievement.finished) finishedAchievements++;

          item.append(name);

          const listItem = $("<li></li>");

          listItem.append(item);

          self.achievementsList.append(listItem);
        });
      }

      _.each(quests, function(quest) {
        const item = self.getItem(true, quest.id);
        const name = self.getName(true, quest.id);

        name.text(quest.name);

        name.css("background", "rgba(255, 10, 10, 0.3)");

        if (quest.stage > 0 && quest.stage < 9999) {
          name.css("background", "rgba(255, 255, 10, 0.4)");
        } else if (quest.stage > 9998) {
          name.css("background", "rgba(10, 255, 10, 0.3)");
        }

        if (quest.finished) finishedQuests++;

        item.append(name);

        const listItem = $("<li></li>");

        listItem.append(item);

        self.questList.append(listItem);
      });

      self.achievementsCount.html(
        finishedAchievements + "/" + achievements.length
      );
      self.questCount.html(finishedQuests + "/" + quests.length);
    },

    progress(info) {
      const self = this;
      const item = info.isQuest
        ? self.getQuest(info.id)
        : self.getAchievement(info.id);

      if (!item) return;

      const name = item.find(
        "" + (info.isQuest ? "#quest" : "#achievement") + info.id + "name"
      );

      if (!name) return;

      if (!info.isQuest && info.count > 2) {
        name.text(info.name + " " + info.progress + "/" + (info.count - 1));
      }

      name.css("background", "rgba(255, 255, 10, 0.4)");
    },

    finish(info) {
      const self = this;
      const item = info.isQuest
        ? self.getQuest(info.id)
        : self.getAchievement(info.id);

      if (!item) return;

      const name = item.find(
        "" + (info.isQuest ? "#quest" : "#achievement") + info.id + "name"
      );

      if (!name) return;

      if (!info.isQuest) name.text(info.name);

      name.css("background", "rgba(10, 255, 10, 0.3)");
    },

    getQuest(id) {
      return $(this.questList.find("li")[id]).find("#quest" + id);
    },

    getAchievement(id) {
      return $(this.achievementsList.find("li")[id]).find("#achievement" + id);
    },

    /**
     * Might as well properly organize them based
     * on their type of item and id (index).
     */

    getItem(isQuest, id) {
      return $(
        "<div id=\"" +
          (isQuest ? "quest" : "achievement") +
          id +
          "\" class=\"questItem\"></div>"
      );
    },

    getName(isQuest, id) {
      return $(
        "<div id=\"" +
          (isQuest ? "quest" : "achievement") +
          id +
          "name\" class=\"questName\"></div>"
      );
    }
  });
});
