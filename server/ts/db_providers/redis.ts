import Utils from "../utils";
import Player from "../player";
import Messages from "../message";
import * as redis from "redis";
import * as bcrypt from "bcrypt";
import * as _ from "underscore";
import Types from "../../../shared/js/gametypes";

export default class DatabaseHandler {
  client: redis.RedisClient;
  constructor(config: any) {
    let options: any = {
      socket_nodelay: true
    };
    this.client = redis.createClient(
      config.redis_port,
      config.redis_host,
      options
    );
    this.client.auth(config.redis_password || "");
  }

  loadPlayer(player: Player) {
    let userKey = "u:" + player.name;
    let curTime = new Date().getTime();
    this.client.smembers("usr", (err, replies) => {
      for (let index = 0; index < replies.length; index++) {
        if (replies[index].toString() === player.name) {
          this.client
            .multi()
            .hget(userKey, "pw") // 0
            .hget(userKey, "armor") // 1
            .hget(userKey, "weapon") // 2
            .hget(userKey, "exp") // 3
            .hget("b:" + player.connection.connection.remoteAddress, "time") // 4
            .hget(
              "b:" + player.connection.connection.remoteAddress,
              "banUseTime"
            ) // 5
            .hget(
              "b:" + player.connection.connection.remoteAddress,
              "loginTime"
            ) // 6
            .hget(userKey, "avatar") // 7
            .zrange("adrank", -1, -1) // 8
            .get("nextNewArmor") // 9
            .hget(userKey, "inventory0") // 10
            .hget(userKey, "inventory0:number") // 11
            .hget(userKey, "inventory1") // 12
            .hget(userKey, "inventory1:number") // 13
            .hget(userKey, "achievement1:found") // 14
            .hget(userKey, "achievement1:progress") // 15
            .hget(userKey, "achievement2:found") // 16
            .hget(userKey, "achievement2:progress") // 17
            .hget(userKey, "achievement3:found") // 18
            .hget(userKey, "achievement3:progress") // 19
            .hget(userKey, "achievement4:found") // 20
            .hget(userKey, "achievement4:progress") // 21
            .hget(userKey, "achievement5:found") // 22
            .hget(userKey, "achievement5:progress") // 23
            .hget(userKey, "achievement6:found") // 24
            .hget(userKey, "achievement6:progress") // 25
            .smembers("adminname") // 26
            .zscore("adrank", player.name) // 27
            .hget(userKey, "weaponAvatar") // 28
            .hget(userKey, "x") // 29
            .hget(userKey, "y") // 30
            .hget(userKey, "achievement7:found") // 31
            .hget(userKey, "achievement7:progress") // 32
            .hget(userKey, "achievement8:found") // 33
            .hget(userKey, "achievement8:progress") // 34
            .hget("cb:" + player.connection.connection.remoteAddress, "etime") // 35
            .exec((err, replies) => {
              if (err) throw err;

              let pw = replies[0];
              let armor = replies[1];
              let weapon = replies[2];
              let exp = Utils.NaN2Zero(replies[3]);
              let bannedTime = Utils.NaN2Zero(replies[4]);
              let banUseTime = Utils.NaN2Zero(replies[5]);
              let lastLoginTime = Utils.NaN2Zero(replies[6]);
              let avatar = replies[7];
              let pubTopName = replies[8];
              let nextNewArmor = replies[9];
              let inventory = [replies[10], replies[12]];
              let inventoryNumber = [
                Utils.NaN2Zero(replies[11]),
                Utils.NaN2Zero(replies[13])
              ];
              let achievementFound = [
                Utils.trueFalse(replies[14]),
                Utils.trueFalse(replies[16]),
                Utils.trueFalse(replies[18]),
                Utils.trueFalse(replies[20]),
                Utils.trueFalse(replies[22]),
                Utils.trueFalse(replies[24]),
                Utils.trueFalse(replies[31]),
                Utils.trueFalse(replies[33])
              ];
              let achievementProgress = [
                Utils.NaN2Zero(replies[15]),
                Utils.NaN2Zero(replies[17]),
                Utils.NaN2Zero(replies[19]),
                Utils.NaN2Zero(replies[21]),
                Utils.NaN2Zero(replies[23]),
                Utils.NaN2Zero(replies[25]),
                Utils.NaN2Zero(replies[32]),
                Utils.NaN2Zero(replies[34])
              ];
              let adminnames = replies[26];
              let pubPoint = Utils.NaN2Zero(replies[27]);
              let weaponAvatar = replies[28] ? replies[28] : weapon;
              let x = Utils.NaN2Zero(replies[29]);
              let y = Utils.NaN2Zero(replies[30]);
              let chatBanEndTime = Utils.NaN2Zero(replies[35]);

              // Check Password

              bcrypt.compare(player.pw, pw, (err, res) => {
                if (!res) {
                  player.connection.sendUTF8("invalidlogin");
                  player.connection.close("Wrong Password: " + player.name);
                  return;
                }

                let d = new Date();
                let lastLoginTimeDate = new Date(lastLoginTime);
                if (
                  lastLoginTimeDate.getDate() !== d.getDate() &&
                  pubPoint > 0
                ) {
                  let targetInventoryNumber = -1;
                  if (inventory[0] === "burger") {
                    targetInventoryNumber = 0;
                  } else if (inventory[1] === "burger") {
                    targetInventoryNumber = 1;
                  } else if (inventory[0] === null) {
                    targetInventoryNumber = 0;
                  } else if (inventory[1] === null) {
                    targetInventoryNumber = 1;
                  }

                  if (targetInventoryNumber >= 0) {
                    if (pubPoint > 100) {
                      pubPoint = 100;
                    }
                    inventory[targetInventoryNumber] = "burger";
                    inventoryNumber[targetInventoryNumber] += pubPoint * 10;
                    this.setInventory(
                      player.name,
                      Types.getKindFromString("burger"),
                      targetInventoryNumber,
                      inventoryNumber[targetInventoryNumber]
                    );
                    this.client.zrem("adrank", player.name);
                  }
                }

                // Check Ban
                d.setDate(d.getDate() - d.getDay());
                d.setHours(0, 0, 0);
                if (lastLoginTime < d.getTime()) {
                  console.info(player.name + "ban is initialized.");
                  bannedTime = 0;
                  this.client.hset(
                    "b:" + player.connection.connection.remoteAddress,
                    "time",
                    bannedTime.toString()
                  );
                }
                this.client.hset(
                  "b:" + player.connection.connection.remoteAddress,
                  "loginTime",
                  curTime.toString()
                );

                if (player.name === pubTopName.toString()) {
                  avatar = nextNewArmor;
                }

                let admin = null;
                let i = 0;
                for (i = 0; i < adminnames.length; i++) {
                  if (adminnames[i] === player.name) {
                    admin = 1;
                    console.info("Admin " + player.name + "login");
                  }
                }
                console.info("Player name: " + player.name);
                console.info("Armor: " + armor);
                console.info("Weapon: " + weapon);
                console.info("Experience: " + exp);
                console.info("Banned Time: " + new Date(bannedTime).toString());
                console.info(
                  "Ban Use Time: " + new Date(banUseTime).toString()
                );
                console.info(
                  "Last Login Time: " + lastLoginTimeDate.toString()
                );
                console.info(
                  "Chatting Ban End Time: " +
                    new Date(chatBanEndTime).toString()
                );

                player.sendWelcome(
                  armor,
                  weapon,
                  avatar,
                  weaponAvatar,
                  exp,
                  admin,
                  bannedTime,
                  banUseTime,
                  inventory,
                  inventoryNumber,
                  achievementFound,
                  achievementProgress,
                  x,
                  y,
                  chatBanEndTime
                );
              });
            });
          return;
        }
      }

      // Could not find the user
      player.connection.sendUTF8("invalidlogin");
      player.connection.close("User does not exist: " + player.name);
      return;
    });
  }

  createPlayer(player: Player) {
    let userKey = "u:" + player.name;
    let curTime = new Date().getTime();

    // Check if username is taken
    this.client.sismember("usr", player.name, (err, reply) => {
      if (err) throw err;

      if (reply === 1) {
        player.connection.sendUTF8("userexists");
        player.connection.close("Username not available: " + player.name);
        return;
      } else {
        // Add the player
        this.client
          .multi()
          .sadd("usr", player.name)
          .hset(userKey, "pw", player.pw)
          .hset(userKey, "email", player.email)
          .hset(userKey, "armor", "clotharmor")
          .hset(userKey, "avatar", "clotharmor")
          .hset(userKey, "weapon", "sword1")
          .hset(userKey, "exp", "0")
          .hset(
            "b:" + player.connection.connection.remoteAddress,
            "loginTime",
            curTime.toString()
          )
          .exec((err, replies) => {
            if (err) throw err;

            console.info("New User: " + player.name);
            player.sendWelcome(
              "clotharmor",
              "sword1",
              "clotharmor",
              "sword1",
              0,
              null,
              0,
              0,
              [null, null],
              [0, 0],
              [false, false, false, false, false, false],
              [0, 0, 0, 0, 0, 0],
              player.x,
              player.y,
              0
            );
          });
      }
    });
  }

  checkBan(player: Player) {
    this.client.smembers("ipban", (err, replies) => {
      for (let index = 0; index < replies.length; index++) {
        if (
          replies[index].toString() ===
          player.connection.connection.remoteAddress
        ) {
          this.client
            .multi()
            .hget("b:" + player.connection.connection.remoteAddress, "rtime")
            .hget("b:" + player.connection.connection.remoteAddress, "time")
            .exec((err, replies) => {
              let curTime = new Date();
              let banEndTime = new Date(replies[0] * 1);
              console.info("curTime: " + curTime.toString());
              console.info("banEndTime: " + banEndTime.toString());
              if (banEndTime.getTime() > curTime.getTime()) {
                player.connection.sendUTF8("ban");
                player.connection.close(
                  "IP Banned player: " +
                    player.name +
                    " " +
                    player.connection.connection.remoteAddress
                );
              }
            });
          return;
        }
      }
    });
  }
  banPlayer(adminPlayer: Player, banPlayer: Player, days: number) {
    this.client.smembers("adminname", (err, replies) => {
      for (let index = 0; index < replies.length; index++) {
        if (replies[index].toString() === adminPlayer.name) {
          let curTime = new Date().getTime();
          this.client.sadd(
            "ipban",
            banPlayer.connection.connection.remoteAddress
          );
          adminPlayer.server.pushBroadcast(
            new Messages.Chat(
              banPlayer,
              "/1 " +
                adminPlayer.name +
                "-- 밴 ->" +
                banPlayer.name +
                " " +
                days +
                "일"
            )
          );
          setTimeout(() => {
            banPlayer.connection.close(
              "Added IP Banned player: " +
                banPlayer.name +
                " " +
                banPlayer.connection.connection.remoteAddress
            );
          }, 30000);
          this.client.hset(
            "b:" + banPlayer.connection.connection.remoteAddress,
            "rtime",
            (curTime + days * 24 * 60 * 60 * 1000).toString()
          );
          console.info(
            adminPlayer.name +
              "-- BAN ->" +
              banPlayer.name +
              " to " +
              new Date(curTime + days * 24 * 60 * 60 * 1000).toString()
          );
          return;
        }
      }
    });
  }
  chatBan(adminPlayer: Player, targetPlayer: Player) {
    this.client.smembers("adminname", (err, replies) => {
      for (let index = 0; index < replies.length; index++) {
        if (replies[index].toString() === adminPlayer.name) {
          let curTime = new Date().getTime();
          adminPlayer.server.pushBroadcast(
            new Messages.Chat(
              targetPlayer,
              "/1 " +
                adminPlayer.name +
                "-- 채금 ->" +
                targetPlayer.name +
                " 10분"
            )
          );
          targetPlayer.chatBanEndTime = curTime + 10 * 60 * 1000;
          this.client.hset(
            "cb:" + targetPlayer.connection.connection.remoteAddress,
            "etime",
            targetPlayer.chatBanEndTime.toString()
          );
          console.info(
            adminPlayer.name +
              "-- Chatting BAN ->" +
              targetPlayer.name +
              " to " +
              new Date(targetPlayer.chatBanEndTime).toString()
          );
          return;
        }
      }
    });
  }
  newBanPlayer(adminPlayer: Player, banPlayer: Player) {
    console.debug("1");
    if (adminPlayer.experience > 100000) {
      console.debug("2");
      this.client.hget(
        "b:" + adminPlayer.connection.connection.remoteAddress,
        "banUseTime",
        (err, reply: any) => {
          console.debug("3");
          let curTime = new Date();
          console.debug("curTime: " + curTime.getTime());
          console.debug("bannable Time: " + reply * 1 + 1000 * 60 * 60 * 24);
          if (curTime.getTime() > reply * 1 + 1000 * 60 * 60 * 24) {
            console.debug("4");
            banPlayer.bannedTime++;
            let banMsg =
              "" +
              adminPlayer.name +
              "-- 밴 ->" +
              banPlayer.name +
              " " +
              banPlayer.bannedTime +
              "번째 " +
              Math.pow(2, banPlayer.bannedTime) / 2 +
              "분";
            this.client.sadd(
              "ipban",
              banPlayer.connection.connection.remoteAddress
            );
            this.client.hset(
              "b:" + banPlayer.connection.connection.remoteAddress,
              "rtime",
              (
                curTime.getTime() +
                Math.pow(2, banPlayer.bannedTime) * 500 * 60
              ).toString()
            );
            this.client.hset(
              "b:" + banPlayer.connection.connection.remoteAddress,
              "time",
              banPlayer.bannedTime.toString()
            );
            this.client.hset(
              "b:" + adminPlayer.connection.connection.remoteAddress,
              "banUseTime",
              curTime.getTime().toString()
            );
            setTimeout(() => {
              banPlayer.connection.close(
                "Added IP Banned player: " +
                  banPlayer.name +
                  " " +
                  banPlayer.connection.connection.remoteAddress
              );
            }, 30000);
            adminPlayer.server.pushBroadcast(
              new Messages.Chat(banPlayer, "/1 " + banMsg)
            );
            console.info(banMsg);
          }
          return;
        }
      );
    }
  }
  banTerm(time: number) {
    return Math.pow(2, time) * 500 * 60;
  }
  equipArmor(name: string, armor: string) {
    console.info("Set Armor: " + name + " " + armor);
    this.client.hset("u:" + name, "armor", armor);
  }
  equipAvatar(name: string, armor: string) {
    console.info("Set Avatar: " + name + " " + armor);
    this.client.hset("u:" + name, "avatar", armor);
  }
  equipWeapon(name: string, weapon: string) {
    console.info("Set Weapon: " + name + " " + weapon);
    this.client.hset("u:" + name, "weapon", weapon);
  }
  setExp(name: string, exp: string) {
    console.info("Set Exp: " + name + " " + exp);
    this.client.hset("u:" + name, "exp", exp);
  }
  setInventory(
    name: string,
    itemKind: any,
    inventoryNumber: number,
    itemNumber: number
  ) {
    if (itemKind) {
      this.client.hset(
        `u:${name}`,
        `inventory${inventoryNumber}`,
        Types.getKindAsString(itemKind)
      );
      this.client.hset(
        `u: ${name}`,
        `inventory${inventoryNumber}:number`,
        itemNumber.toString()
      );
      console.info(
        "SetInventory: " +
          name +
          ", " +
          Types.getKindAsString(itemKind) +
          ", " +
          inventoryNumber +
          ", " +
          itemNumber
      );
    } else {
      this.makeEmptyInventory(name, inventoryNumber.toString());
    }
  }
  makeEmptyInventory(name: string, number: string) {
    console.info("Empty Inventory: " + name + " " + number);
    this.client.hdel("u:" + name, "inventory" + number);
    this.client.hdel("u:" + name, "inventory" + number + ":number");
  }
  foundAchievement(name: string, number: string) {
    console.info("Found Achievement: " + name + " " + number);
    this.client.hset("u:" + name, "achievement" + number + ":found", "true");
  }
  progressAchievement(name: string, number: string, progress: string) {
    console.info(
      "Progress Achievement: " + name + " " + number + " " + progress
    );
    this.client.hset(
      "u:" + name,
      "achievement" + number + ":progress",
      progress
    );
  }
  setUsedPubPts(name: string, usedPubPts: string) {
    console.info("Set Used Pub Points: " + name + " " + usedPubPts);
    this.client.hset("u:" + name, "usedPubPts", usedPubPts);
  }
  setCheckpoint(name: string, x: string, y: string) {
    console.info("Set Check Point: " + name + " " + x + " " + y);
    this.client.hset("u:" + name, "x", x);
    this.client.hset("u:" + name, "y", y);
  }
  loadBoard(
    player: {
      name: string | string[];
      send: { (arg0: any[]): void; (arg0: any[]): void; (arg0: any[]): void };
      level: number;
    },
    command: string,
    number: string | number,
    replyNumber: number
  ) {
    console.info(
      "Load Board: " +
        player.name +
        " " +
        command +
        " " +
        number +
        " " +
        replyNumber
    );
    if (command === "view") {
      this.client
        .multi()
        .hget("bo:free", number + ":title")
        .hget("bo:free", number + ":content")
        .hget("bo:free", number + ":writer")
        .hincrby("bo:free", number + ":cnt", 1)
        .smembers("bo:free:" + number + ":up")
        .smembers("bo:free:" + number + ":down")
        .hget("bo:free", number + ":time")
        .exec((err, replies) => {
          let title = replies[0];
          let content = replies[1];
          let writer = replies[2];
          let counter = replies[3];
          let up = replies[4].length;
          let down = replies[5].length;
          let time = replies[6];
          player.send([
            Types.Messages.BOARD,
            "view",
            title,
            content,
            writer,
            counter,
            up,
            down,
            time
          ]);
        });
    } else if (command === "reply") {
      this.client
        .multi()
        .hget("bo:free", number + ":reply:" + replyNumber + ":writer")
        .hget("bo:free", number + ":reply:" + replyNumber + ":content")
        .smembers("bo:free:" + number + ":reply:" + replyNumber + ":up")
        .smembers("bo:free:" + number + ":reply:" + replyNumber + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 1) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 1) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 2) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 2) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 3) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 3) + ":down")

        .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":writer")
        .hget("bo:free", number + ":reply:" + (replyNumber + 4) + ":content")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":up")
        .smembers("bo:free:" + number + ":reply:" + (replyNumber + 4) + ":down")

        .exec((err, replies) => {
          player.send([
            Types.Messages.BOARD,
            "reply",
            replies[0],
            replies[1],
            replies[2].length,
            replies[3].length,
            replies[4],
            replies[5],
            replies[6].length,
            replies[7].length,
            replies[8],
            replies[9],
            replies[10].length,
            replies[11].length,
            replies[12],
            replies[13],
            replies[14].length,
            replies[15].length,
            replies[16],
            replies[17],
            replies[18].length,
            replies[19].length
          ]);
        });
    } else if (command === "up") {
      if (player.level >= 50) {
        this.client.sadd("bo:free:" + number + ":up", player.name);
      }
    } else if (command === "down") {
      if (player.level >= 50) {
        this.client.sadd("bo:free:" + number + ":down", player.name);
      }
    } else if (command === "replyup") {
      if (player.level >= 50) {
        this.client.sadd(
          "bo:free:" + number + ":reply:" + replyNumber + ":up",
          player.name
        );
      }
    } else if (command === "replydown") {
      if (player.level >= 50) {
        this.client.sadd(
          "bo:free:" + number + ":reply:" + replyNumber + ":down",
          player.name
        );
      }
    } else if (command === "list") {
      this.client.hget("bo:free", "lastnum", (err, reply) => {
        let lastnum: any = reply;
        if (number > 0) {
          lastnum = number;
        }
        this.client
          .multi()
          .hget("bo:free", lastnum + ":title")
          .hget("bo:free", lastnum - 1 + ":title")
          .hget("bo:free", lastnum - 2 + ":title")
          .hget("bo:free", lastnum - 3 + ":title")
          .hget("bo:free", lastnum - 4 + ":title")
          .hget("bo:free", lastnum - 5 + ":title")
          .hget("bo:free", lastnum - 6 + ":title")
          .hget("bo:free", lastnum - 7 + ":title")
          .hget("bo:free", lastnum - 8 + ":title")
          .hget("bo:free", lastnum - 9 + ":title")

          .hget("bo:free", lastnum + ":writer")
          .hget("bo:free", lastnum - 1 + ":writer")
          .hget("bo:free", lastnum - 2 + ":writer")
          .hget("bo:free", lastnum - 3 + ":writer")
          .hget("bo:free", lastnum - 4 + ":writer")
          .hget("bo:free", lastnum - 5 + ":writer")
          .hget("bo:free", lastnum - 6 + ":writer")
          .hget("bo:free", lastnum - 7 + ":writer")
          .hget("bo:free", lastnum - 8 + ":writer")
          .hget("bo:free", lastnum - 9 + ":writer")

          .hget("bo:free", lastnum + ":cnt")
          .hget("bo:free", lastnum - 1 + ":cnt")
          .hget("bo:free", lastnum - 2 + ":cnt")
          .hget("bo:free", lastnum - 3 + ":cnt")
          .hget("bo:free", lastnum - 4 + ":cnt")
          .hget("bo:free", lastnum - 5 + ":cnt")
          .hget("bo:free", lastnum - 6 + ":cnt")
          .hget("bo:free", lastnum - 7 + ":cnt")
          .hget("bo:free", lastnum - 8 + ":cnt")
          .hget("bo:free", lastnum - 9 + ":cnt")

          .smembers("bo:free:" + lastnum + ":up")
          .smembers("bo:free:" + (lastnum - 1) + ":up")
          .smembers("bo:free:" + (lastnum - 2) + ":up")
          .smembers("bo:free:" + (lastnum - 3) + ":up")
          .smembers("bo:free:" + (lastnum - 4) + ":up")
          .smembers("bo:free:" + (lastnum - 5) + ":up")
          .smembers("bo:free:" + (lastnum - 6) + ":up")
          .smembers("bo:free:" + (lastnum - 7) + ":up")
          .smembers("bo:free:" + (lastnum - 8) + ":up")
          .smembers("bo:free:" + (lastnum - 9) + ":up")

          .smembers("bo:free:" + lastnum + ":down")
          .smembers("bo:free:" + (lastnum - 1) + ":down")
          .smembers("bo:free:" + (lastnum - 2) + ":down")
          .smembers("bo:free:" + (lastnum - 3) + ":down")
          .smembers("bo:free:" + (lastnum - 4) + ":down")
          .smembers("bo:free:" + (lastnum - 5) + ":down")
          .smembers("bo:free:" + (lastnum - 6) + ":down")
          .smembers("bo:free:" + (lastnum - 7) + ":down")
          .smembers("bo:free:" + (lastnum - 8) + ":down")
          .smembers("bo:free:" + (lastnum - 9) + ":down")

          .hget("bo:free", lastnum + ":replynum")
          .hget("bo:free", lastnum + 1 + ":replynum")
          .hget("bo:free", lastnum + 2 + ":replynum")
          .hget("bo:free", lastnum + 3 + ":replynum")
          .hget("bo:free", lastnum + 4 + ":replynum")
          .hget("bo:free", lastnum + 5 + ":replynum")
          .hget("bo:free", lastnum + 6 + ":replynum")
          .hget("bo:free", lastnum + 7 + ":replynum")
          .hget("bo:free", lastnum + 8 + ":replynum")
          .hget("bo:free", lastnum + 9 + ":replynum")

          .exec((err, replies) => {
            let i = 0;
            let msg = [Types.Messages.BOARD, "list", lastnum];

            for (i = 0; i < 30; i++) {
              msg.push(replies[i]);
            }
            for (i = 30; i < 50; i++) {
              msg.push(replies[i].length);
            }
            for (i = 50; i < 60; i++) {
              msg.push(replies[i]);
            }

            player.send(msg);
          });
      });
    }
  }
  writeBoard(
    player: { name: string; send: (arg0: any[]) => void },
    title: string,
    content: string
  ) {
    console.info("Write Board: " + player.name + " " + title);
    this.client.hincrby("bo:free", "lastnum", 1, (err, reply) => {
      let curTime: any = new Date().getTime();
      let number = reply ? reply : 1;
      this.client
        .multi()
        .hset("bo:free", number + ":title", title)
        .hset("bo:free", number + ":content", content)
        .hset("bo:free", number + ":writer", player.name)
        .hset("bo:free", number + ":time", curTime)
        .exec();
      player.send([
        Types.Messages.BOARD,
        "view",
        title,
        content,
        player.name,
        0,
        0,
        0,
        curTime
      ]);
    });
  }
  writeReply(
    player: { name: string; send: (arg0: any[]) => void },
    content: string,
    number: string
  ) {
    console.info("Write Reply: " + player.name + " " + content + " " + number);

    this.client.hincrby("bo:free", number + ":replynum", 1, (err, reply) => {
      let replyNum = reply ? reply : 1;
      this.client
        .multi()
        .hset("bo:free", number + ":reply:" + replyNum + ":content", content)
        .hset("bo:free", number + ":reply:" + replyNum + ":writer", player.name)
        .exec((err, replies) => {
          player.send([Types.Messages.BOARD, "reply", player.name, content]);
        });
    });
  }
  pushKungWord(
    player: { server: any; send: (arg0: any[]) => void },
    word: string
  ) {
    let server = player.server;

    if (player === server.lastKungPlayer) {
      return;
    }
    if (server.isAlreadyKung(word)) {
      return;
    }
    if (!server.isRightKungWord(word)) {
      return;
    }

    if (server.kungWords.length === 0) {
      this.client.srandmember("dic", (err, reply) => {
        let randWord = reply;
        server.pushKungWord(player, randWord);
      });
    } else {
      this.client.sismember("dic", word, (err, reply) => {
        if (reply === 1) {
          server.pushKungWord(player, word);
        } else {
          player.send([Types.Messages.NOTIFY, word + "는 사전에 없습니다."]);
        }
      });
    }
  }
}
