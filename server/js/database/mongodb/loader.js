/* global module */

class Loader {
  constructor(database) {
    this.database = database;
  }

  getInventory(player, callback) {
    const self = this;

    self.database.getDatabase(function(database) {
      const inventory = database.collection("player_inventory");
      const cursor = inventory.find({ username: player.username });

      cursor.toArray().then(function(inventoryArray) {
        const info = inventoryArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving inventory data for: " +
                player.username
            );
          }

          callback(
            info.ids.split(" "),
            info.counts.split(" "),
            info.abilities.split(" "),
            info.abilityLevels.split(" ")
          );
        }
      });
    });
  }

  getBank(player, callback) {
    const self = this;

    self.database.getDatabase(function(database) {
      const bank = database.collection("player_bank");
      const cursor = bank.find({ username: player.username });

      cursor.toArray().then(function(bankArray) {
        const info = bankArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving bank data for: " +
                player.username
            );
          }

          callback(
            info.ids.split(" "),
            info.counts.split(" "),
            info.abilities.split(" "),
            info.abilityLevels.split(" ")
          );
        }
      });
    });
  }

  getQuests(player, callback) {
    const self = this;

    self.database.getDatabase(function(database) {
      const quests = database.collection("player_quests");
      const cursor = quests.find({ username: player.username });

      cursor.toArray().then(function(questArray) {
        const info = questArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving quest data for: " +
                player.username
            );
          }

          callback(info.ids.split(" "), info.stages.split(" "));
        } else callback(null, null);
      });
    });
  }

  getAchievements(player, callback) {
    const self = this;

    self.database.getDatabase(function(database) {
      const achievements = database.collection("player_achievements");
      const cursor = achievements.find({ username: player.username });

      cursor.toArray().then(function(achievementsArray) {
        const info = achievementsArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving achievement data for: " +
                player.username
            );
          }

          callback(info.ids.split(" "), info.progress.split(" "));
        }
      });
    });
  }
}

module.exports = Loader;
