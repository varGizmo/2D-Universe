import * as _ from "underscore";
import Messages from "./message";
import Mob from "./mob";
import Map from "./map";
import NPC from "./npc";
import Player from "./player";
import Item from "./item";
import Chest from "./chest";
import Utils from "./utils";
import MobArea from "./mobarea";
import ChestArea from "./chestarea";
import Types from "../../shared/js/gametypes";
import Properties from "./properties";
import Entity from "./entity";
import Character from "./character";
import Guild from "./guild";

// ====================================================== //
// ===================== GAME SERVER ==================== //
// ====================================================== //

export default class World {
  id: any;
  maxPlayers: any;
  server: any;
  ups: number;
  databaseHandler: any;
  map!: Map;
  entities: { [key: string]: any };
  players: { [key: string]: any };
  guilds: { [key: string]: any };
  mobs: { [key: string]: any };
  attackers: { [key: string]: any };
  items: { [key: string]: any };
  equipping: { [key: string]: any };
  hurt: { [key: string]: any };
  npcs: { [key: string]: any };
  mobAreas: any[];
  chestAreas: any[];
  groups: { [key: string]: any };
  outgoingQueues: { [key: string]: any };
  itemCount: number;
  playerCount: number;
  zoneGroupsReady: boolean;
  regen_cb: any;
  init_cb: any;
  connect_cb: any;
  enter_cb: any;
  added_cb: any;
  removed_cb: any;
  attack_cb: any;
  constructor(
    id: string,
    maxPlayers: any,
    websocketServer: any,
    databaseHandler?: any
  ) {
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.server = websocketServer;
    this.ups = 50;
    this.databaseHandler = databaseHandler;

    this.entities = {};
    this.players = {};
    this.guilds = {};
    this.mobs = {};
    this.attackers = {};
    this.items = {};
    this.equipping = {};
    this.hurt = {};
    this.npcs = {};
    this.mobAreas = [];
    this.chestAreas = [];
    this.groups = {};

    this.outgoingQueues = {};

    this.itemCount = 0;
    this.playerCount = 0;

    this.zoneGroupsReady = false;

    this.onPlayerConnect((player: any) => {
      player.onRequestPosition(() => {
        if (player.lastCheckpoint) {
          return player.lastCheckpoint.getRandomPosition();
        } else {
          return this.map.getRandomStartingPosition();
        }
      });
    });

    this.onPlayerEnter((player: Player) => {
      console.info(
        player.name +
          "(" +
          player.connection.connection.remoteAddress +
          ") has joined " +
          this.id +
          " in guild " +
          player.guildId
      );

      if (!player.hasEnteredGame) {
        this.incrementPlayerCount();
      }

      // Number of players in this world
      this.pushToPlayer(player, new Messages.Population(this.playerCount));
      if (player.hasGuild()) {
        this.pushToGuild(
          player.getGuild(),
          //@ts-ignore
          new Messages.Guild(Types.Messages.GUILDACTION.CONNECT, player.name),
          player
        );
        let names = _.without(player.getGuild().memberNames(), player.name);
        if (names.length > 0) {
          this.pushToPlayer(
            player,
            //@ts-ignore
            new Messages.Guild(Types.Messages.GUILDACTION.ONLINE, names)
          );
        }
      }
      this.pushRelevantEntityListTo(player);

      let move_cb = (x: string, y: string) => {
        console.debug(player.name + " is moving to (" + x + ", " + y + ").");
        let isPVP = this.map.isPVP(x, y);
        player.flagPVP(isPVP);
        player.forEachAttacker(mob => {
          if (mob.target === null) {
            player.removeAttacker(mob);
            return;
          }
          let target = this.getEntityById(mob.target);
          if (target) {
            let pos = this.findPositionNextTo(mob, target);
            if (mob.distanceToSpawningPoint(pos.x, pos.y) > 50) {
              mob.clearTarget();
              mob.forgetEveryone();
              player.removeAttacker(mob);
            } else {
              this.moveEntity(mob, pos.x, pos.y);
            }
          }
        });
      };

      player.onMove(move_cb);
      player.onLootMove(move_cb);

      player.onZone(() => {
        let hasChangedGroups = this.handleEntityGroupMembership(player);

        if (hasChangedGroups) {
          this.pushToPreviousGroups(player, new Messages.Destroy(player));
          this.pushRelevantEntityListTo(player);
        }
      });

      player.onBroadcast((message: any, ignorethis: any) => {
        this.pushToAdjacentGroups(
          player.group,
          message,
          ignorethis ? player.id : null
        );
      });

      player.onBroadcastToZone((message: any, ignorethis: any) => {
        this.pushToGroup(player.group, message, ignorethis ? player.id : null);
      });

      player.onExit(() => {
        console.info(player.name + " has left the game.");
        if (player.hasGuild()) {
          this.pushToGuild(
            player.getGuild(),
            //@ts-ignore
            new Messages.Guild(
              Types.Messages.GUILDACTION.DISCONNECT,
              player.name
            ),
            player
          );
        }
        this.removePlayer(player);
        this.decrementPlayerCount();

        if (this.removed_cb) {
          this.removed_cb();
        }
      });

      if (this.added_cb) {
        this.added_cb();
      }
    });

    // Called when an entity is attacked by another entity
    this.onEntityAttack((attacker: any) => {
      let target = this.getEntityById(attacker.target);
      if (target && attacker.type === "mob") {
        let pos = this.findPositionNextTo(attacker, target);
        this.moveEntity(attacker, pos.x, pos.y);
      }
    });

    this.onRegenTick(() => {
      this.forEachCharacter((character: Character) => {
        if (!character.hasFullHealth()) {
          character.regenHealthBy(Math.floor(character.maxHitPoints / 25));

          if (character.type === "player") {
            this.pushToPlayer(character, character.regen());
          }
        }
      });
    });
  }

  run(mapFilePath: string | number | Buffer | import("url").URL) {
    this.map = new Map(mapFilePath);

    this.map.ready(() => {
      this.initZoneGroups();

      this.map.generateCollisionGrid();

      // Populate all mob "roaming" areas
      _.each(this.map.mobAreas, (a: any) => {
        let area = new MobArea(
          a.id,
          a.nb,
          a.type,
          a.x,
          a.y,
          a.width,
          a.height,
          this
        );
        area.spawnMobs();
        area.onEmpty(this.handleEmptyMobArea.bind(this, area));

        this.mobAreas.push(area);
      });

      // Create all chest areas
      _.each(this.map.chestAreas, (a: any) => {
        let area = new ChestArea(
          a.id,
          a.x,
          a.y,
          a.w,
          a.h,
          a.tx,
          a.ty,
          a.i,
          this
        );
        this.chestAreas.push(area);
        area.onEmpty(this.handleEmptyChestArea.bind(this, area));
      });

      // Spawn static chests
      _.each(this.map.staticChests, (chest: any) => {
        let c = this.createChest(chest.x, chest.y, chest.i);
        this.addStaticItem(c);
      });

      // Spawn static entities
      this.spawnStaticEntities();

      // Set maximum number of entities contained in each chest area
      _.each(this.chestAreas, area => {
        area.setNumberOfEntities(area.entities.length);
      });
    });

    let regenCount = this.ups * 2;
    let updateCount = 0;
    setInterval(() => {
      this.processGroups();
      this.processQueues();

      if (updateCount < regenCount) {
        updateCount += 1;
      } else {
        if (this.regen_cb) {
          this.regen_cb();
        }
        updateCount = 0;
      }
    }, 1000 / this.ups);

    console.info(
      "" + this.id + " created (capacity: " + this.maxPlayers + " players)."
    );
  }

  setUpdatesPerSecond(ups: number) {
    this.ups = ups;
  }

  onInit(cb: any) {
    this.init_cb = cb;
  }

  onPlayerConnect(cb: (player: Player) => void) {
    this.connect_cb = cb;
  }

  onPlayerEnter(cb: (player: Player) => void) {
    this.enter_cb = cb;
  }

  onPlayerAdded(cb: () => void) {
    this.added_cb = cb;
  }

  onPlayerRemoved(cb: () => void) {
    this.removed_cb = cb;
  }

  onRegenTick(cb: () => void) {
    this.regen_cb = cb;
  }

  pushRelevantEntityListTo(player: Player) {
    let entities;

    if (player && player.group in this.groups) {
      entities = _.keys(this.groups[player.group].entities);
      entities = _.reject(entities, id => {
        return id == player.id;
      });
      entities = _.map(entities, id => {
        return parseInt(id, 10);
      });
      if (entities) {
        this.pushToPlayer(player, new Messages.List(entities));
      }
    }
  }

  pushSpawnsToPlayer(player: Player) {
    // ?
    let ids: any[] = [];

    _.each(ids, id => {
      let entity = this.getEntityById(id);
      if (entity) {
        this.pushToPlayer(player, new Messages.Spawn(entity));
      }
    });

    console.debug("Pushed " + _.size(ids) + " new spawns to " + player.id);
  }

  pushToPlayer(player: Entity, message: any) {
    if (player && player.id in this.outgoingQueues) {
      this.outgoingQueues[player.id].push(message.serialize());
    } else {
      console.error("pushToPlayer: player was undefined");
    }
  }

  pushToGuild(
    guild: {
      forEachMember: {
        (arg0: (player: any, id: any) => void): void;
        (arg0: (player: any, id: any) => void): void;
      };
    },
    message: any,
    except: { id: number }
  ) {
    if (guild) {
      if (typeof except === "undefined") {
        guild.forEachMember((player: any, id: any) => {
          this.pushToPlayer(this.getEntityById(id), message);
        });
      } else {
        guild.forEachMember((player: any, id: string) => {
          if (parseInt(id, 10) !== except.id) {
            this.pushToPlayer(this.getEntityById(id), message);
          }
        });
      }
    } else {
      console.error("pushToGuild: guild was undefined");
    }
  }

  pushToGroup(groupId: any, message: any, ignoredPlayer?: any) {
    let group = this.groups[groupId];

    if (group) {
      _.each(group.players, playerId => {
        if (playerId != ignoredPlayer) {
          this.pushToPlayer(this.getEntityById(playerId), message);
        }
      });
    } else {
      console.error("groupId: " + groupId + " is not a valid group");
    }
  }

  pushToAdjacentGroups(groupId: any, message: any, ignoredPlayer?: any) {
    this.map.forEachAdjacentGroup(groupId, (id: any) => {
      this.pushToGroup(id, message, ignoredPlayer);
    });
  }

  pushToPreviousGroups(player: Player, message: any) {
    // Push this message to all groups which are not going to be updated anymore,
    // since the player left them.
    _.each(player.recentlyLeftGroups, id => {
      this.pushToGroup(id, message);
    });
    player.recentlyLeftGroups = [];
  }

  pushBroadcast(message: any, ignoredPlayer?: any) {
    for (let id in this.outgoingQueues) {
      if (id != ignoredPlayer) {
        this.outgoingQueues[id].push(message.serialize());
      }
    }
  }

  processQueues() {
    // ?
    let connection: any;

    for (let id in this.outgoingQueues) {
      if (this.outgoingQueues[id].length > 0) {
        connection = this.server.getConnection(id);
        connection.send(this.outgoingQueues[id]);
        this.outgoingQueues[id] = [];
      }
    }
  }

  addEntity(entity: any) {
    this.entities[entity.id] = entity;
    this.handleEntityGroupMembership(entity);
  }

  removeEntity(entity: any) {
    if (entity.id in this.entities) {
      delete this.entities[entity.id];
    }
    if (entity.id in this.mobs) {
      delete this.mobs[entity.id];
    }
    if (entity.id in this.items) {
      delete this.items[entity.id];
    }

    if (entity.type === "mob") {
      this.clearMobAggroLink(entity);
      this.clearMobHateLinks(entity);
    }

    entity.destroy();
    this.removeFromGroups(entity);
    console.debug(
      "Removed " + Types.getKindAsString(entity.kind) + " : " + entity.id
    );
  }

  joinGuild(player: Player, guildId: number, answer?: any) {
    if (typeof this.guilds[guildId] === "undefined") {
      this.pushToPlayer(
        player,
        //@ts-ignore
        new Messages.GuildError(
          Types.Messages.GUILDERRORTYPE.DOESNOTEXIST,
          guildId
        )
      );
    }
    //#guildupdate (guildrules)
    else {
      let formerGuildId;
      if (player.hasGuild()) {
        formerGuildId = player.guildId;
      }
      let res = this.guilds[guildId].addMember(player, answer);
      if (res !== false && typeof formerGuildId !== "undefined") {
        this.guilds[formerGuildId].removeMember(player);
      }
      return res;
    }
    return false;
  }

  reloadGuild(guildId: any, guildName: any) {
    let res: any = false;
    let lastItem: any = 0;
    if (typeof this.guilds[guildId] !== "undefined") {
      if (this.guilds[guildId].name === guildName) {
        res = guildId;
      }
    }
    if (res === false) {
      _.every(this.guilds, (guild, key) => {
        if (guild.name === guildName) {
          res = parseInt(key, 10);
          return false;
        } else {
          lastItem = key;
          return true;
        }
      });
    }

    if (res === false) {
      //first connected after reboot.
      if (typeof this.guilds[guildId] !== "undefined") {
        guildId = parseInt(lastItem, 10) + 1;
      }
      this.guilds[guildId] = new Guild(guildId, guildName, this);
      res = guildId;
    }
    return res;
  }

  addGuild(guildName: any) {
    let res: any = true;
    let id: any = 0; //an ID here
    res = _.every(this.guilds, (guild, key) => {
      id = parseInt(key, 10) + 1;
      return guild.name !== guildName;
    });
    if (res) {
      this.guilds[id] = new Guild(id, guildName, this);
      res = id;
    }
    return res;
  }

  addPlayer(player: Player, guildId: any) {
    this.addEntity(player);
    this.players[player.id] = player;
    this.outgoingQueues[player.id] = [];
    let res = true;
    if (typeof guildId !== "undefined") {
      res = this.joinGuild(player, guildId);
    }
    return res;
  }

  removePlayer(player: Player) {
    player.broadcast(player.despawn());
    this.removeEntity(player);
    if (player.hasGuild()) {
      player.getGuild().removeMember(player);
    }
    delete this.players[player.id];
    delete this.outgoingQueues[player.id];
  }
  loggedInPlayer(name: any) {
    for (let id in this.players) {
      if (this.players[id].name === name) {
        if (!this.players[id].isDead) return true;
      }
    }
    return false;
  }

  addMob(mob: Mob) {
    this.addEntity(mob);
    this.mobs[mob.id] = mob;
  }

  addNPC(kind: any, x: number, y: number) {
    let npc = new NPC("8" + x + "" + y, kind, x, y);
    this.addEntity(npc);
    this.npcs[npc.id] = npc;
    return npc;
  }

  addItem(item: Item) {
    this.addEntity(item);
    this.items[item.id] = item;

    return item;
  }

  createItem(kind: any, x: number, y: number) {
    let id = "9" + this.itemCount++,
      item = null;

    if (kind === Types.Entities.CHEST) {
      item = new Chest(id, x, y);
    } else {
      item = new Item(id, kind, x, y);
    }
    return item;
  }

  createChest(x: any, y: any, items: any) {
    let chest = this.createItem(Types.Entities.CHEST, x, y);
    chest.setItems(items);
    return chest;
  }

  addStaticItem(item: Item) {
    item.isStatic = true;
    item.onRespawn(this.addStaticItem.bind(this, item));

    return this.addItem(item);
  }

  addItemFromChest(kind: any, x: any, y: any) {
    let item = this.createItem(kind, x, y);
    item.isFromChest = true;

    return this.addItem(item);
  }

  /**
   * The mob will no longer be registered as an attacker of its current target.
   */
  clearMobAggroLink(mob: Mob) {
    let player = null;
    if (mob.target) {
      player = this.getEntityById(mob.target);
      if (player) {
        player.removeAttacker(mob);
      }
    }
  }

  clearMobHateLinks(mob: Mob) {
    if (mob) {
      _.each(mob.hatelist, obj => {
        let player = this.getEntityById(obj.id);
        if (player) {
          player.removeHater(mob);
        }
      });
    }
  }

  forEachEntity(cb: (arg0: any) => void) {
    for (let id in this.entities) {
      cb(this.entities[id]);
    }
  }

  forEachPlayer(cb: (arg0: any) => void) {
    for (let id in this.players) {
      cb(this.players[id]);
    }
  }

  forEachMob(cb: (arg0: any) => void) {
    for (let id in this.mobs) {
      cb(this.mobs[id]);
    }
  }

  forEachCharacter(cb: any) {
    this.forEachPlayer(cb);
    this.forEachMob(cb);
  }

  handleMobHate(mobId: any, playerId: any, hatePoints: any) {
    let mob = this.getEntityById(mobId),
      player = this.getEntityById(playerId),
      mostHated;

    if (player && mob) {
      mob.increaseHateFor(playerId, hatePoints);
      player.addHater(mob);

      if (mob.hitPoints > 0) {
        // only choose a target if still alive
        this.chooseMobTarget(mob);
      }
    }
  }

  chooseMobTarget(mob: Mob, hateRank?: any) {
    let player = this.getEntityById(mob.getHatedPlayerId(hateRank));

    // If the mob is not already attacking the player, create an attack link between them.
    if (player && !(mob.id in player.attackers)) {
      this.clearMobAggroLink(mob);

      player.addAttacker(mob);
      mob.setTarget(player);

      this.broadcastAttacker(mob);
      console.debug(mob.id + " is now attacking " + player.id);
    }
  }

  onEntityAttack(cb: (attacker: any) => void) {
    this.attack_cb = cb;
  }

  getEntityById(id: any) {
    if (id in this.entities) {
      return this.entities[id];
    } else {
      console.error("Unknown entity : " + id);
    }
  }

  getPlayerCount() {
    let count = 0;
    for (let p in this.players) {
      if (this.players.hasOwnProperty(p)) {
        count += 1;
      }
    }
    return count;
  }

  broadcastAttacker(character: Character) {
    if (character) {
      this.pushToAdjacentGroups(
        character.group,
        character.attack(),
        character.id
      );
    }
    if (this.attack_cb) {
      this.attack_cb(character);
    }
  }

  handleHurtEntity(entity: any, damage: any) {
    entity.forEachAttacker((attacker: any) => {
      if (entity.type === "player") {
        // A player is only aware of his own hitpoints
        this.pushToPlayer(entity, entity.health());
      }

      if (entity.type === "mob") {
        // Let the mob's attacker (player) know how much damage was inflicted
        this.pushToPlayer(
          attacker,
          new Messages.Damage(
            entity,
            damage,
            entity.hitPoints,
            entity.maxHitPoints
          )
        );
      }

      // If the entity is about to die
      if (entity.hitPoints <= 0) {
        if (entity.type === "mob") {
          let mob = entity,
            item = this.getDroppedItem(mob);
          let mainTanker = this.getEntityById(mob.getMainTankerId());

          if (mainTanker && mainTanker instanceof Player) {
            mainTanker.incExp(Types.getMobExp(mob.kind));
            this.pushToPlayer(
              mainTanker,
              new Messages.Kill(mob, mainTanker.level, mainTanker.experience)
            );
          } else {
            attacker.incExp(Types.getMobExp(mob.kind));
            this.pushToPlayer(
              attacker,
              new Messages.Kill(mob, attacker.level, attacker.experience)
            );
          }

          this.pushToAdjacentGroups(mob.group, mob.despawn()); // Despawn must be enqueued before the item drop
          if (item) {
            this.pushToAdjacentGroups(mob.group, mob.drop(item));
            this.handleItemDespawn(item);
          }
        }

        if (entity.type === "player") {
          this.handlePlayerVanish(entity);
          this.pushToAdjacentGroups(entity.group, entity.despawn());
        }

        this.removeEntity(entity);
      }
    });
  }

  despawn(entity: { group: any; despawn: () => void; id: string }) {
    this.pushToAdjacentGroups(entity.group, entity.despawn());

    if (entity.id in this.entities) {
      this.removeEntity(entity);
    }
  }

  spawnStaticEntities() {
    let count = 0;

    _.each(this.map.staticEntities, (kindName, tid) => {
      let kind = Types.getKindFromString(kindName),
        pos = this.map.tileIndexToGridPosition(tid);

      if (Types.isNPC(kind)) {
        this.addNPC(kind, pos.x + 1, pos.y);
      }
      if (Types.isMob(kind)) {
        let mob = new Mob("7" + kind + count++, kind, pos.x + 1, pos.y);
        mob.onRespawn(() => {
          mob.isDead = false;
          this.addMob(mob);
          if (mob.area && mob.area instanceof ChestArea) {
            mob.area.addToArea(mob);
          }
        });
        mob.onMove(this.onMobMoveCallback.bind(this));
        this.addMob(mob);
        this.tryAddingMobToChestArea(mob);
      }
      if (Types.isItem(kind)) {
        this.addStaticItem(this.createItem(kind, pos.x + 1, pos.y));
      }
    });
  }

  isValidPosition(x: any, y: any) {
    if (
      this.map &&
      _.isNumber(x) &&
      _.isNumber(y) &&
      !this.map.isOutOfBounds(x, y) &&
      !this.map.isColliding(x, y)
    ) {
      return true;
    }
    return false;
  }

  handlePlayerVanish(player: Player) {
    let previousAttackers: any[] = [];

    // When a player dies or teleports, all of his attackers go and attack their second most hated player.
    player.forEachAttacker((mob: any) => {
      previousAttackers.push(mob);
      this.chooseMobTarget(mob, 2);
    });

    _.each(previousAttackers, mob => {
      player.removeAttacker(mob);
      mob.clearTarget();
      mob.forgetPlayer(player.id, 1000);
    });

    this.handleEntityGroupMembership(player);
  }

  setPlayerCount(count: number) {
    this.playerCount = count;
  }

  incrementPlayerCount() {
    this.setPlayerCount(this.playerCount + 1);
  }

  decrementPlayerCount() {
    if (this.playerCount > 0) {
      this.setPlayerCount(this.playerCount - 1);
    }
  }

  getDroppedItem(mob: { kind: any; x: any; y: any }) {
    let kind = Types.getKindAsString(mob.kind),
      drops = Properties[kind].drops,
      v = Utils.random(100),
      p = 0,
      item = null;

    for (let itemName in drops) {
      let percentage = drops[itemName];

      p += percentage;
      if (v <= p) {
        item = this.addItem(
          this.createItem(Types.getKindFromString(itemName), mob.x, mob.y)
        );
        break;
      }
    }

    return item;
  }

  onMobMoveCallback(mob: Player) {
    this.pushToAdjacentGroups(mob.group, new Messages.Move(mob));
    this.handleEntityGroupMembership(mob);
  }

  findPositionNextTo(entity: Entity, target: any) {
    let valid = false,
      pos = { x: 0, y: 0 };

    while (!valid) {
      pos = entity.getPositionNextTo(target);
      valid = this.isValidPosition(pos.x, pos.y);
    }
    return pos;
  }

  initZoneGroups() {
    this.map.forEachGroup((id: string | number) => {
      this.groups[id] = { entities: {}, players: [], incoming: [] };
    });
    this.zoneGroupsReady = true;
  }

  removeFromGroups(entity: Entity) {
    let oldGroups: any[] = [];

    if (entity && entity.group) {
      let group = this.groups[entity.group];
      if (entity instanceof Player) {
        group.players = _.reject(group.players, id => {
          return id === entity.id;
        });
      }

      this.map.forEachAdjacentGroup(entity.group, (id: string) => {
        if (entity.id in this.groups[id].entities) {
          delete this.groups[id].entities[entity.id];
          oldGroups.push(id);
        }
      });
      entity.group = null;
    }
    return oldGroups;
  }

  /**
   * Registers an entity as "incoming" into several groups, meaning that it just entered them.
   * All players inside these groups will receive a Spawn message when WorldServer.processGroups is called.
   */
  addAsIncomingToGroup(entity: any, groupId: any) {
    let isChest = entity && entity instanceof Chest,
      isItem = entity && entity instanceof Item,
      isDroppedItem =
        entity && isItem && !entity.isStatic && !entity.isFromChest;

    if (entity && groupId) {
      this.map.forEachAdjacentGroup(groupId, (id: string | number) => {
        let group = this.groups[id];

        if (group) {
          if (
            !_.include(group.entities, entity.id) &&
            //  Items dropped off of mobs are handled differently via DROP messages. See handleHurtEntity.
            (!isItem || isChest || (isItem && !isDroppedItem))
          ) {
            group.incoming.push(entity);
          }
        }
      });
    }
  }

  addToGroup(entity: { id: string | number; group: any }, groupId: string) {
    let newGroups: any[] = [];

    if (entity && groupId && groupId in this.groups) {
      this.map.forEachAdjacentGroup(groupId, (id: string | number) => {
        this.groups[id].entities[entity.id] = entity;
        newGroups.push(id);
      });
      entity.group = groupId;

      if (entity instanceof Player) {
        this.groups[groupId].players.push(entity.id);
      }
    }
    return newGroups;
  }

  logGroupPlayers(groupId: string) {
    console.debug("Players inside group " + groupId + ":");
    _.each(this.groups[groupId].players, id => {
      console.debug("- player " + id);
    });
  }

  handleEntityGroupMembership(entity: Player) {
    let hasChangedGroups = false;
    if (entity) {
      let groupId = this.map.getGroupIdFromPosition(entity.x, entity.y);
      if (!entity.group || (entity.group && entity.group !== groupId)) {
        hasChangedGroups = true;
        this.addAsIncomingToGroup(entity, groupId);
        let oldGroups = this.removeFromGroups(entity);
        let newGroups = this.addToGroup(entity, groupId);

        if (_.size(oldGroups) > 0) {
          entity.recentlyLeftGroups = _.difference(oldGroups, newGroups);
          console.debug("group diff: " + entity.recentlyLeftGroups);
        }
      }
    }
    return hasChangedGroups;
  }

  processGroups() {
    if (this.zoneGroupsReady) {
      this.map.forEachGroup((id: string | number) => {
        let spawns: any = [];
        if (this.groups[id].incoming.length > 0) {
          spawns = _.each(this.groups[id].incoming, entity => {
            if (entity instanceof Player) {
              this.pushToGroup(id, new Messages.Spawn(entity), entity.id);
            } else {
              this.pushToGroup(id, new Messages.Spawn(entity));
            }
          });
          this.groups[id].incoming = [];
        }
      });
    }
  }

  moveEntity(entity: Player, x: any, y: any) {
    if (entity) {
      entity.setPosition(x, y);
      this.handleEntityGroupMembership(entity);
    }
  }

  handleItemDespawn(item: Item) {
    if (item) {
      item.handleDespawn({
        beforeBlinkDelay: 10000,
        blinkCallback() {
          this.pushToAdjacentGroups(item.group, new Messages.Blink(item));
        },
        blinkingDuration: 4000,
        despawnCallback() {
          this.pushToAdjacentGroups(item.group, new Messages.Destroy(item));
          this.removeEntity(item);
        }
      });
    }
  }

  handleEmptyMobArea(area: MobArea) {}

  handleEmptyChestArea(area: { chestX: any; chestY: any; items: any }) {
    if (area) {
      let chest = this.addItem(
        this.createChest(area.chestX, area.chestY, area.items)
      );
      this.handleItemDespawn(chest);
    }
  }

  handleOpenedChest(chest: Chest, player: any) {
    this.pushToAdjacentGroups(chest.group, chest.despawn());
    this.removeEntity(chest);

    let kind: any = chest.getRandomItem();
    if (kind) {
      let item = this.addItemFromChest(kind, chest.x, chest.y);
      this.handleItemDespawn(item);
    }
  }
  getPlayerByName(name: any) {
    for (let id in this.players) {
      if (this.players[id].name === name) {
        return this.players[id];
      }
    }
    return null;
  }
  tryAddingMobToChestArea(mob: Mob) {
    _.each(this.chestAreas, area => {
      if (area.contains(mob)) {
        area.addToArea(mob);
      }
    });
  }

  updatePopulation(totalPlayers?: any) {
    this.pushBroadcast(
      new Messages.Population(
        this.playerCount,
        totalPlayers ? totalPlayers : this.playerCount
      )
    );
  }
}
