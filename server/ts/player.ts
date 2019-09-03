import * as _ from "underscore";
import Messages from "./message";
import Formulas from "./formulas";
import Chest from "./chest";
import Character from "./character";
import Properties from "./properties";
import Mob from "./mob";
import Utils from "./utils";
import FormatChecker from "./format";
import Types from "../../shared/js/gametypes";
import * as bcrypt from "bcrypt";

export default class Player extends Character {
  weaponLevel: any;
  armorLevel: any;
  armor: any;
  databaseHandler: any;
  recentlyLeftGroups!: any[];
  zone_cb() {
    throw new Error("Method not implemented.");
  }
  connection: any;
  server: any;
  hasEnteredGame: boolean;
  isDead: boolean;
  haters: { [key: string]: any };
  lastCheckpoint: any;
  disconnectTimeout: any;
  pvpFlag: boolean;
  bannedTime: number;
  banUseTime: number;
  experience: any;
  level: number;
  lastWorldChatMinutes: number;
  inventory: any[];
  inventoryCount: any[];
  achievement: any[];
  chatBanEndTime: number;
  name!: string;
  pw!: string;
  email!: string;
  move_cb: any;
  lootmove_cb: any;
  firepotionTimeout: any;
  group: any;
  message_cb: any;
  exit_cb: any;
  weapon: any;
  broadcast_cb: any;
  broadcastzone_cb: any;
  orient_cb: any;
  avatar: any;
  requestpos_cb: any;
  guildId: any;
  admin: any;
  constructor(
    connection: { id: any },
    worldServer: any,
    databaseHandler?: any
  ) {
    super(connection.id, "player", Types.Entities.WARRIOR, 0, 0);

    this.server = worldServer;
    this.connection = connection;
    this.databaseHandler = databaseHandler;

    this.hasEnteredGame = false;
    this.isDead = false;
    this.haters = {};
    this.lastCheckpoint = null;
    this.disconnectTimeout = null;

    this.pvpFlag = false;
    this.bannedTime = 0;
    this.banUseTime = 0;
    this.experience = 0;
    this.level = 0;
    this.lastWorldChatMinutes = 99;

    this.inventory = [];
    this.inventoryCount = [];
    this.achievement = [];

    this.chatBanEndTime = 0;

    this.connection.listen((message: any[]) => {
      let action = parseInt(message[0]);

      console.debug("Received: " + message);
      if (!new FormatChecker().check(message)) {
        this.connection.close(
          `Invalid ${Types.getMessageTypeAsString(
            action
          )} message format: ${message}`
        );
        return;
      }

      if (
        !this.hasEnteredGame &&
        action !== Types.Messages.CREATE &&
        action !== Types.Messages.LOGIN
      ) {
        // CREATE or LOGIN must be the first message
        this.connection.close(`Invalid handshake message: ${message}`);
        return;
      }
      if (
        this.hasEnteredGame &&
        !this.isDead &&
        (action === Types.Messages.CREATE || action === Types.Messages.LOGIN)
      ) {
        // CREATE/LOGIN can be sent only once
        this.connection.close(`Cannot initiate handshake twice: ${message}`);
        return;
      }

      this.resetTimeout();

      if (action === Types.Messages.CREATE || action === Types.Messages.LOGIN) {
        let name = Utils.sanitize(message[1]);
        let pw = Utils.sanitize(message[2]);

        // Always ensure that the name is not longer than a maximum length.
        // (also enforced by the maxlength attribute of the name input element).
        this.name = name.substr(0, 12).trim();

        // Validate the username
        if (!this.checkName(this.name)) {
          this.connection.sendUTF8("invalidusername");
          this.connection.close(`Invalid name ${this.name}`);
          return;
        }
        this.pw = pw.substr(0, 15);

        if (action === Types.Messages.CREATE) {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) throw new Error(err.message);

            bcrypt.hash(this.pw, salt, (err, hash) => {
              if (err) throw new Error(err.message);

              console.info(`CREATE: ${this.name}`);
              this.email = Utils.sanitize(message[3]);
              this.pw = hash;
              databaseHandler.createPlayer(this);
            });
          });
        } else {
          console.info("LOGIN: " + this.name);
          if (this.server.loggedInPlayer(this.name)) {
            this.connection.sendUTF8("loggedin");
            this.connection.close(`Already logged in ${this.name}`);
            return;
          }
          databaseHandler.checkBan(this);
          databaseHandler.loadPlayer(this);
        }

        // this.kind = Types.Entities.WARRIOR;
        // this.equipArmor(message[2]);
        // this.equipWeapon(message[3]);
        // if(typeof message[4] !== 'undefined') {
        //     let aGuildId = this.server.reloadGuild(message[4],message[5]);
        //     if( aGuildId !== message[4]) {
        //         this.server.pushToPlayer(this, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.IDWARNING,message[5]));
        //     }
        // }
        // this.orientation = Utils.randomOrientation();
        // this.updateHitPoints();
        // this.updatePosition();

        // this.server.addPlayer(this, aGuildId);
        // this.server.enter_cb(this);

        // this.send([Types.Messages.WELCOME, this.id, this.name, this.x, this.y, this.hitPoints]);
        // this.hasEnteredGame = true;
        // this.isDead = false;
      } else if (action === Types.Messages.WHO) {
        console.info(`WHO: ${this.name}`);
        message.shift();
        this.server.pushSpawnsToPlayer(this, message);
      } else if (action === Types.Messages.ZONE) {
        console.info(`ZONE: ${this.name}`);
        this.zone_cb();
      } else if (action === Types.Messages.CHAT) {
        let msg = Utils.sanitize(message[1]);
        console.info(`CHAT: ${this.name}: ${msg}`);

        // Sanitized messages may become empty. No need to broadcast empty chat messages.
        if (msg && msg !== "") {
          msg = msg.substr(0, 60); // Enforce maxlength of chat input
          // CHAD COMMAND HANDLING IN ASKY VERSION HAPPENS HERE!
          this.broadcastToZone(new Messages.Chat(this, msg), false);
        }
      } else if (action === Types.Messages.MOVE) {
        console.info(`MOVE: ${this.name}(${message[1]}, ${message[2]})`);
        if (this.move_cb) {
          let x = message[1],
            y = message[2];

          if (this.server.isValidPosition(x, y)) {
            this.setPosition(x, y);
            this.clearTarget();

            this.broadcast(new Messages.Move(this));
            this.move_cb(this.x, this.y);
          }
        }
      } else if (action === Types.Messages.LOOTMOVE) {
        console.info(`LOOTMOVE: ${this.name}(${message[1]}, ${message[2]})`);
        if (this.lootmove_cb) {
          this.setPosition(message[1], message[2]);

          let item = this.server.getEntityById(message[3]);
          if (item) {
            this.clearTarget();

            this.broadcast(new Messages.LootMove(this, item));
            this.lootmove_cb(this.x, this.y);
          }
        }
      } else if (action === Types.Messages.AGGRO) {
        console.info(`AGGRO: ${this.name} ${message[1]}`);
        if (this.move_cb) {
          this.server.handleMobHate(message[1], this.id, 5);
        }
      } else if (action === Types.Messages.ATTACK) {
        console.info(`ATTACK: ${this.name} ${message[1]}`);
        let mob = this.server.getEntityById(message[1]);

        if (mob) {
          this.setTarget(mob);
          this.server.broadcastAttacker(this);
        }
      } else if (action === Types.Messages.HIT) {
        console.info(`HIT: ${this.name} ${message[1]}`);
        let mob = this.server.getEntityById(message[1]);
        if (mob) {
          let dmg = Formulas.dmg(this.weaponLevel, mob.armorLevel);

          if (dmg > 0) {
            if (mob.type !== "player") {
              mob.receiveDamage(dmg, this.id);
              this.server.handleMobHate(mob.id, this.id, dmg);
              this.server.handleHurtEntity(mob, this, dmg);
            }
          } else {
            mob.hitPoints -= dmg;
            mob.server.handleHurtEntity(mob);
            if (mob.hitPoints <= 0) {
              mob.isDead = true;
              this.server.pushBroadcast(
                new Messages.Chat(
                  this,
                  `${this.name}M-M-M-MONSTER KILLED${mob.name}`
                )
              );
            }
          }
        }
      } else if (action === Types.Messages.HURT) {
        console.info(`HURT: ${this.name} ${message[1]}`);
        let mob = this.server.getEntityById(message[1]);
        if (mob && this.hitPoints > 0) {
          this.hitPoints -= Formulas.dmg(mob.weaponLevel, this.armorLevel);
          this.server.handleHurtEntity(this);

          if (this.hitPoints <= 0) {
            this.isDead = true;
            if (this.firepotionTimeout) {
              clearTimeout(this.firepotionTimeout);
            }
          }
        }
      } else if (action === Types.Messages.LOOT) {
        console.info(`LOOT: ${this.name} ${message[1]}`);
        let item = this.server.getEntityById(message[1]);

        if (item) {
          let kind = item.kind;

          if (Types.isItem(kind)) {
            this.broadcast(item.despawn());
            this.server.removeEntity(item);

            if (kind === Types.Entities.FIREPOTION) {
              this.updateHitPoints();
              this.broadcast(this.equip(Types.Entities.FIREFOX));
              this.firepotionTimeout = setTimeout(() => {
                this.broadcast(this.equip(this.armor)); // return to normal after 15 sec
                this.firepotionTimeout = null;
              }, 15000);
              this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
            } else if (Types.isHealingItem(kind)) {
              let amount = 0;

              switch (kind) {
                case Types.Entities.FLASK:
                  amount = 40;
                  break;
                case Types.Entities.BURGER:
                  amount = 100;
                  break;
              }

              if (!this.hasFullHealth()) {
                this.regenHealthBy(amount);
                this.server.pushToPlayer(this, this.health());
              }
            } else if (Types.isArmor(kind) || Types.isWeapon(kind)) {
              this.equipItem(item.kind);
              this.broadcast(this.equip(kind));
            }
          }
        }
      } else if (action === Types.Messages.TELEPORT) {
        console.info(`TELEPORT: ${this.name}(${message[1]}, ${message[2]})`);
        let x = message[1],
          y = message[2];

        if (this.server.isValidPosition(x, y)) {
          this.setPosition(x, y);
          this.clearTarget();

          this.broadcast(new Messages.Teleport(this));

          this.server.handlePlayerVanish(this);
          this.server.pushRelevantEntityListTo(this);
        }
      } else if (action === Types.Messages.OPEN) {
        console.info(`OPEN: ${this.name} ${message[1]}`);
        let chest = this.server.getEntityById(message[1]);
        if (chest && chest instanceof Chest) {
          this.server.handleOpenedChest(chest, this);
        }
      } else if (action === Types.Messages.CHECK) {
        console.info(`CHECK: ${this.name} ${message[1]}`);
        let checkpoint = this.server.map.getCheckpoint(message[1]);
        if (checkpoint) {
          this.lastCheckpoint = checkpoint;
          databaseHandler.setCheckpoint(this.name, this.x, this.y);
        }
      } else if (action === Types.Messages.INVENTORY) {
        console.info(
          `INVENTORY: ${this.name} ${message[1]} ${message[2]} ${message[3]}`
        );
        let inventoryNumber = message[2],
          count = message[3];

        if (inventoryNumber !== 0 && inventoryNumber !== 1) {
          return;
        }

        let itemKind = this.inventory[inventoryNumber];
        if (itemKind) {
          if (message[1] === "avatar" || message[1] === "armor") {
            if (message[1] === "avatar") {
              this.inventory[inventoryNumber] = null;
              databaseHandler.makeEmptyInventory(this.name, inventoryNumber);
              this.equipItem(itemKind, true);
            } else {
              this.inventory[inventoryNumber] = this.armor;
              databaseHandler.setInventory(
                this.name,
                this.armor,
                inventoryNumber,
                1
              );
              this.equipItem(itemKind, false);
            }
            this.broadcast(this.equip(itemKind));
          } else if (message[1] === "empty") {
            // let item = this.server.addItem(this.server.createItem(itemKind, this.x, this.y));
            let item = this.server.addItemFromChest(itemKind, this.x, this.y);
            if (Types.isHealingItem(item.kind)) {
              if (count < 0) count = 0;
              else if (count > this.inventoryCount[inventoryNumber])
                count = this.inventoryCount[inventoryNumber];
              item.count = count;
            }

            if (item.count > 0) {
              this.server.handleItemDespawn(item);

              if (Types.isHealingItem(item.kind)) {
                if (item.count === this.inventoryCount[inventoryNumber]) {
                  this.inventory[inventoryNumber] = null;
                  databaseHandler.makeEmptyInventory(
                    this.name,
                    inventoryNumber
                  );
                } else {
                  this.inventoryCount[inventoryNumber] -= item.count;
                  databaseHandler.setInventory(
                    this.name,
                    this.inventory[inventoryNumber],
                    inventoryNumber,
                    this.inventoryCount[inventoryNumber]
                  );
                }
              } else {
                this.inventory[inventoryNumber] = null;
                databaseHandler.makeEmptyInventory(this.name, inventoryNumber);
              }
            }
          } else if (message[1] === "eat") {
            let amount = 0;

            switch (itemKind) {
              case Types.Entities.FLASK:
                amount = 80;
                break;
              case Types.Entities.BURGER:
                amount = 200;
                break;
            }

            if (!this.hasFullHealth()) {
              this.regenHealthBy(amount);
              this.server.pushToPlayer(this, this.health());
            }
            this.inventoryCount[inventoryNumber] -= 1;
            if (this.inventoryCount[inventoryNumber] <= 0) {
              this.inventory[inventoryNumber] = null;
            }
            databaseHandler.setInventory(
              this.name,
              this.inventory[inventoryNumber],
              inventoryNumber,
              this.inventoryCount[inventoryNumber]
            );
          }
        }
      } else if (action === Types.Messages.ACHIEVEMENT) {
        console.info(`ACHIEVEMENT: ${this.name} ${message[1]} ${message[2]}`);
        if (message[2] === "found") {
          this.achievement[message[1]].found = true;
          databaseHandler.foundAchievement(this.name, message[1]);
        }
      } else if (action === Types.Messages.GUILD) {
        if (message[1] === Types.Messages.GUILDACTION.CREATE) {
          let guildname = Utils.sanitize(message[2]);
          if (guildname === "") {
            //inaccurate name
            this.server.pushToPlayer(
              this,

              //@ts-ignore
              new Messages.GuildError(
                Types.Messages.GUILDERRORTYPE.BADNAME,
                message[2]
              )
            );
          } else {
            let guildId = this.server.addGuild(guildname);
            if (guildId === false) {
              this.server.pushToPlayer(
                this,
                // TODO: Guilds
                //@ts-ignore
                new Messages.GuildError(
                  Types.Messages.GUILDERRORTYPE.ALREADYEXISTS,
                  guildname
                )
              );
            } else {
              this.server.joinGuild(this, guildId);
              this.server.pushToPlayer(
                this,

                //@ts-ignore
                new Messages.Guild(Types.Messages.GUILDACTION.CREATE, [
                  guildId,
                  guildname
                ])
              );
            }
          }
        } else if (message[1] === Types.Messages.GUILDACTION.INVITE) {
          let userName = message[2];
          let invitee;
          if (this.group in this.server.groups) {
            invitee = _.find(
              this.server.groups[this.group].entities,
              (entity, key) => {
                return entity instanceof Player && entity.name == userName
                  ? entity
                  : false;
              }
            );
            if (invitee) {
              this.getGuild().invite(invitee, this);
            }
          }
        } else if (message[1] === Types.Messages.GUILDACTION.JOIN) {
          this.server.joinGuild(this, message[2], message[3]);
        } else if (message[1] === Types.Messages.GUILDACTION.LEAVE) {
          this.leaveGuild();
        } else if (message[1] === Types.Messages.GUILDACTION.TALK) {
          this.server.pushToGuild(
            this.getGuild(),

            //@ts-ignore
            new Messages.Guild(Types.Messages.GUILDACTION.TALK, [
              this.name,
              this.id,
              message[2]
            ])
          );
        }
      } else {
        if (this.message_cb) {
          this.message_cb(message);
        }
      }
    });

    this.connection.onClose(() => {
      if (this.firepotionTimeout) {
        clearTimeout(this.firepotionTimeout);
      }
      clearTimeout(this.disconnectTimeout);
      if (this.exit_cb) {
        this.exit_cb();
      }
    });

    this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
  }

  destroy() {
    this.forEachAttacker(mob => {
      mob.clearTarget();
    });
    this.attackers = {};

    this.forEachHater((mob: Mob) => {
      mob.forgetPlayer(this.id);
    });
    this.haters = {};
  }

  getState() {
    let basestate = this.getBaseState(),
      state = [
        this.name,
        this.orientation,
        this.armor,
        this.weapon,
        this.level
      ];

    if (this.target) {
      state.push(this.target);
    }

    return basestate.concat(state);
  }

  send(message: any[]) {
    this.connection.send(message);
  }

  flagPVP(pvpFlag: boolean) {
    if (this.pvpFlag != pvpFlag) {
      this.pvpFlag = pvpFlag;
      // TODO: PVP
      //@ts-ignore
      this.send(new Messages.PVP(this.pvpFlag).serialize());
    }
  }

  broadcast(message: any, ignorethis?: any) {
    if (this.broadcast_cb) {
      this.broadcast_cb(message, ignorethis === undefined ? true : ignorethis);
    }
  }

  broadcastToZone(message: any, ignorethis: boolean | undefined) {
    if (this.broadcastzone_cb) {
      this.broadcastzone_cb(
        message,
        ignorethis === undefined ? true : ignorethis
      );
    }
  }

  onExit(cb: any) {
    this.exit_cb = cb;
  }

  onMove(cb: any) {
    this.move_cb = cb;
  }

  onLootMove(cb: any) {
    this.lootmove_cb = cb;
  }

  onZone(cb: () => void) {
    this.zone_cb = cb;
  }

  onOrient(cb: any) {
    this.orient_cb = cb;
  }

  onMessage(cb: any) {
    this.message_cb = cb;
  }

  onBroadcast(cb: any) {
    this.broadcast_cb = cb;
  }

  onBroadcastToZone(cb: any) {
    this.broadcastzone_cb = cb;
  }

  equip(item: any) {
    return new Messages.EquipItem(this, item);
  }

  addHater(mob: { id: string }) {
    if (mob) {
      if (!(mob.id in this.haters)) {
        this.haters[mob.id] = mob;
      }
    }
  }

  removeHater(mob: { id: string }) {
    if (mob && mob.id in this.haters) {
      delete this.haters[mob.id];
    }
  }

  forEachHater(cb: { (mob: Mob): void; (arg0: any): void }) {
    _.each(this.haters, mob => {
      cb(mob);
    });
  }

  equipArmor(kind: any) {
    this.armor = kind;
    this.armorLevel = Properties.getArmorLevel(kind);
  }

  equipAvatar(kind: any) {
    if (kind) {
      this.avatar = kind;
    } else {
      this.avatar = Types.Entities.CLOTHARMOR;
    }
  }

  equipWeapon(kind: any) {
    this.weapon = kind;
    this.weaponLevel = Properties.getWeaponLevel(kind);
  }

  equipItem(itemKind: any, isAvatar?: any) {
    if (itemKind) {
      console.debug(this.name + " equips " + Types.getKindAsString(itemKind));

      if (Types.isArmor(itemKind)) {
        if (isAvatar) {
          this.databaseHandler.equipAvatar(
            this.name,
            Types.getKindAsString(itemKind)
          );
          this.equipAvatar(itemKind);
        } else {
          this.databaseHandler.equipAvatar(
            this.name,
            Types.getKindAsString(itemKind)
          );
          this.equipAvatar(itemKind);

          this.databaseHandler.equipArmor(
            this.name,
            Types.getKindAsString(itemKind)
          );
          this.equipArmor(itemKind);
        }
        this.updateHitPoints();
        this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
      } else if (Types.isWeapon(itemKind)) {
        this.databaseHandler.equipWeapon(
          this.name,
          Types.getKindAsString(itemKind)
        );
        this.equipWeapon(itemKind);
      }
    }
  }

  updateHitPoints() {
    this.resetHitPoints(Formulas.hp(this.armorLevel));
  }

  updatePosition() {
    if (this.requestpos_cb) {
      let pos = this.requestpos_cb();
      this.setPosition(pos.x, pos.y);
    }
  }

  onRequestPosition(cb: any) {
    this.requestpos_cb = cb;
  }

  resetTimeout() {
    clearTimeout(this.disconnectTimeout);
    this.disconnectTimeout = setTimeout(
      this.timeout.bind(this),
      1000 * 60 * 15
    ); // 15 min.
  }

  timeout() {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  }

  incExp(gotexp: string) {
    this.experience = parseInt(this.experience) + parseInt(gotexp);
    this.databaseHandler.setExp(this.name, this.experience);
    let origLevel = this.level;
    this.level = Types.getLevel(this.experience);
    if (origLevel !== this.level) {
      this.updateHitPoints();
      this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
    }
  }

  setGuildId(id: string) {
    if (typeof this.server.guilds[id] !== "undefined") {
      this.guildId = id;
    } else {
      console.error(
        this.id + " cannot add guild " + id + ", it does not exist"
      );
    }
  }

  getGuild() {
    return this.hasGuild ? this.server.guilds[this.guildId] : undefined;
  }

  hasGuild() {
    return typeof this.guildId !== "undefined";
  }

  leaveGuild() {
    if (this.hasGuild()) {
      let leftGuild = this.getGuild();
      leftGuild.removeMember(this);
      this.server.pushToGuild(
        leftGuild,

        //@ts-ignore
        new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [
          this.name,
          this.id,
          leftGuild.name
        ])
      );
      delete this.guildId;
      this.server.pushToPlayer(
        this,

        //@ts-ignore
        new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [
          this.name,
          this.id,
          leftGuild.name
        ])
      );
    } else {
      this.server.pushToPlayer(
        this,

        //@ts-ignore
        new Messages.GuildError(Types.Messages.GUILDERRORTYPE.NOLEAVE, "")
      );
    }
  }

  checkName(name: string | null) {
    if (name === null) return false;
    else if (name === "") return false;
    else if (name === " ") return false;

    for (let i = 0; i < name.length; i++) {
      let c = name.charCodeAt(i);

      if (
        !(
          (0xac00 <= c && c <= 0xd7a3) ||
          (0x3131 <= c && c <= 0x318e) || // Korean (Unicode blocks "Hangul Syllables" and "Hangul Compatibility Jamo")
          (0x61 <= c && c <= 0x7a) ||
          (0x41 <= c && c <= 0x5a) || // English (lowercase and uppercase)
          (0x30 <= c && c <= 0x39) || // Numbers
          c == 0x20 ||
          c == 0x5f || // Space and underscore
          c == 0x28 ||
          c == 0x29 || // Parentheses
          c == 0x5e
        )
      ) {
        // Caret
        return false;
      }
    }
    return true;
  }

  sendWelcome(
    armor: any,
    weapon: any,
    avatar: any,
    weaponAvatar: any,
    exp: number,
    admin: any,
    bannedTime: number,
    banUseTime: number,
    inventory: any[],
    inventoryNumber: any[],
    achievementFound: any[],
    achievementProgress: any[],
    x: number,
    y: number,
    chatBanEndTime: number
  ) {
    this.kind = Types.Entities.WARRIOR;
    this.admin = admin;
    this.equipArmor(Types.getKindFromString(armor));
    this.equipAvatar(Types.getKindFromString(avatar));
    this.equipWeapon(Types.getKindFromString(weapon));
    this.inventory[0] = Types.getKindFromString(inventory[0]);
    this.inventory[1] = Types.getKindFromString(inventory[1]);
    this.inventoryCount[0] = inventoryNumber[0];
    this.inventoryCount[1] = inventoryNumber[1];
    this.achievement[1] = {
      found: achievementFound[0],
      progress: achievementProgress[0]
    };
    this.achievement[2] = {
      found: achievementFound[1],
      progress: achievementProgress[1]
    };
    this.achievement[3] = {
      found: achievementFound[2],
      progress: achievementProgress[2]
    };
    this.achievement[4] = {
      found: achievementFound[3],
      progress: achievementProgress[3]
    };
    this.achievement[5] = {
      found: achievementFound[4],
      progress: achievementProgress[4]
    };
    this.achievement[6] = {
      found: achievementFound[5],
      progress: achievementProgress[5]
    };
    this.achievement[7] = {
      found: achievementFound[6],
      progress: achievementProgress[6]
    };
    this.achievement[8] = {
      found: achievementFound[7],
      progress: achievementProgress[7]
    };
    this.bannedTime = bannedTime;
    this.banUseTime = banUseTime;
    this.experience = exp;
    this.level = Types.getLevel(this.experience);
    this.orientation = Utils.randomOrientation;
    this.updateHitPoints();
    if (x === 0 && y === 0) {
      this.updatePosition();
    } else {
      this.setPosition(x, y);
    }
    this.chatBanEndTime = chatBanEndTime;

    this.server.addPlayer(this);
    this.server.enter_cb(this);

    this.send([
      Types.Messages.WELCOME,
      this.id,
      this.name,
      this.x,
      this.y,
      this.hitPoints,
      armor,
      weapon,
      avatar,
      weaponAvatar,
      this.experience,
      this.admin,
      inventory[0],
      inventoryNumber[0],
      inventory[1],
      inventoryNumber[1],
      achievementFound[0],
      achievementProgress[0],
      achievementFound[1],
      achievementProgress[1],
      achievementFound[2],
      achievementProgress[2],
      achievementFound[3],
      achievementProgress[3],
      achievementFound[4],
      achievementProgress[4],
      achievementFound[5],
      achievementProgress[5],
      achievementFound[6],
      achievementProgress[6],
      achievementFound[7],
      achievementProgress[7]
    ]);

    this.hasEnteredGame = true;
    this.isDead = false;

    // this.server.addPlayer(this, aGuildId);
  }
}
