/* global module */

const Packets = require("../network/packets");
const Request = require("request");
const config = require("../../config.json");
const _ = require("underscore");
const Messages = require("../network/messages");
const sanitizer = require("sanitizer");
const Commands = require("./commands");
const Items = require("../util/items");
const Creator = require("../database/mongodb/creator");
const Utils = require("../util/utils");

class Incoming {
  constructor(player) {
    const self = this;

    self.player = player;
    self.connection = self.player.connection;
    self.world = self.player.world;
    self.database = self.player.database;
    self.commands = new Commands(self.player);

    self.connection.listen(function(data) {
      const packet = data.shift();
      const message = data[0];

      if (!Utils.validPacket(packet)) {
        log.error("Non-existent packet received: " + packet + " data: ");
        log.error(message);

        return;
      }

      self.player.refreshTimeout();

      switch (packet) {
        case Packets.Intro:
          self.handleIntro(message);
          break;

        case Packets.Ready:
          self.handleReady(message);
          break;

        case Packets.Who:
          self.handleWho(message);
          break;

        case Packets.Equipment:
          self.handleEquipment(message);
          break;

        case Packets.Movement:
          self.handleMovement(message);
          break;

        case Packets.Request:
          self.handleRequest(message);
          break;

        case Packets.Target:
          self.handleTarget(message);
          break;

        case Packets.Combat:
          self.handleCombat(message);
          break;

        case Packets.Projectile:
          self.handleProjectile(message);
          break;

        case Packets.Network:
          self.handleNetwork(message);
          break;

        case Packets.Chat:
          self.handleChat(message);
          break;

        case Packets.Inventory:
          self.handleInventory(message);
          break;

        case Packets.Bank:
          self.handleBank(message);
          break;

        case Packets.Respawn:
          self.handleRespawn(message);
          break;

        case Packets.Trade:
          self.handleTrade(message);
          break;

        case Packets.Enchant:
          self.handleEnchant(message);
          break;

        case Packets.Click:
          self.handleClick(message);
          break;

        case Packets.Warp:
          self.handleWarp(message);
          break;

        case Packets.Shop:
          self.handleShop(message);
          break;

        case Packets.Camera:
          self.handleCamera(message);
          break;
      }
    });
  }

  handleIntro(message) {
    const self = this;
    const loginType = message.shift();
    const username = message.shift().toLowerCase();
    const password = message.shift();
    const isRegistering = loginType === Packets.IntroOpcode.Register;
    const isGuest = loginType === Packets.IntroOpcode.Guest;
    const email = isRegistering ? message.shift() : "";
    const formattedUsername = username
      ? username.charAt(0).toUpperCase() + username.slice(1)
      : "";

    self.player.username = formattedUsername
      .substr(0, 32)
      .trim()
      .toLowerCase();
    self.player.password = password.substr(0, 32);
    self.player.email = email.substr(0, 128).toLowerCase();

    if (self.introduced) return;

    if (self.world.playerInWorld(self.player.username)) {
      self.connection.sendUTF8("loggedin");
      self.connection.close("Player already logged in..");
      return;
    }

    if (config.overrideAuth) {
      self.database.login(self.player);
      return;
    }

    if (config.offlineMode) {
      const creator = new Creator(null);

      self.player.load(Creator.getFullData(self.player));
      self.player.intro();

      return;
    }

    self.introduced = true;

    if (isRegistering) {
      self.database.exists(self.player, function(result) {
        if (result.exists) {
          self.connection.sendUTF8(result.type + "exists");
          self.connection.close(result.type + " is not available.");
        } else self.database.register(self.player);
      });
    } else if (isGuest) {
      self.player.username = "Guest" + Utils.randomInt(0, 2000000);
      self.player.password = null;
      self.player.email = null;
      self.player.isGuest = true;

      self.database.login(self.player);
    } else {
      self.database.verify(self.player, function(result) {
        if (result.status === "success") self.database.login(self.player);
        else {
          self.connection.sendUTF8("invalidlogin");
          self.connection.close(
            "Wrong password entered for: " + self.player.username
          );
        }
      });
    }
  }

  handleReady(message) {
    const self = this;
    const isReady = message.shift();
    const preloadedData = message.shift();

    if (!isReady) return;

    if (self.player.regionsLoaded.length > 0 && !preloadedData) {
      self.player.regionsLoaded = [];
    }

    self.player.ready = true;

    self.world.region.handle(self.player);
    self.world.region.push(self.player);

    self.player.sendEquipment();
    self.player.loadInventory();
    self.player.loadBank();
    self.player.loadQuests();

    if (self.world.map.isOutOfBounds(self.player.x, self.player.y)) {
      self.player.setPosition(50, 89);
    }

    self.player.save();

    if (self.player.readyCallback) self.player.readyCallback();
  }

  handleWho(message) {
    const self = this;

    _.each(message.shift(), function(id) {
      const entity = self.world.getEntityByInstance(id);

      if (entity && entity.id) self.player.send(new Messages.Spawn(entity));
    });
  }

  handleEquipment(message) {
    const self = this;
    const opcode = message.shift();
    let type;

    switch (opcode) {
      case Packets.EquipmentOpcode.Unequip:
        type = message.shift();

        if (!self.player.inventory.hasSpace()) {
          self.player.send(
            new Messages.Notification(
              Packets.NotificationOpcode.Text,
              "You do not have enough space in your inventory."
            )
          );
          return;
        }

        switch (type) {
          case "weapon":
            if (!self.player.hasWeapon()) return;

            self.player.inventory.add(self.player.weapon.getItem());
            self.player.setWeapon(-1, -1, -1, -1);

            break;

          case "armour":
            if (self.player.hasArmour() && self.player.armour.id === 114) {
              return;
            }

            self.player.inventory.add(self.player.armour.getItem());
            self.player.setArmour(114, 1, -1, -1);

            break;

          case "pendant":
            if (!self.player.hasPendant()) return;

            self.player.inventory.add(self.player.pendant.getItem());
            self.player.setPendant(-1, -1, -1, -1);

            break;

          case "ring":
            if (!self.player.hasRing()) return;

            self.player.inventory.add(self.player.ring.getItem());
            self.player.setRing(-1, -1, -1, -1);

            break;

          case "boots":
            if (!self.player.hasBoots()) return;

            self.player.inventory.add(self.player.boots.getItem());
            self.player.setBoots(-1, -1, -1, -1);
        }

        self.player.send(
          new Messages.Equipment(Packets.EquipmentOpcode.Unequip, [type])
        );
        self.player.sync();
    }
  }

  handleMovement(message) {
    const self = this;
    const opcode = message.shift();

    if (!self.player || self.player.dead) return;

    switch (opcode) {
      case Packets.MovementOpcode.Request:
        {
          const requestX = message.shift();
          const requestY = message.shift();
          const playerX = message.shift();
          const playerY = message.shift();

          if (self.preventNoClip(requestX, requestY)) {
            self.player.guessPosition(requestX, requestY);
          }
        }
        break;

      case Packets.Movement.Started:
        {
          const selectedX = message.shift();
          const selectedY = message.shift();
          const pX = message.shift();
          const pY = message.shift();

          if (
            pX !== self.player.x ||
            pY !== self.player.y ||
            self.player.stunned ||
            !self.preventNoClip(selectedX, selectedY)
          ) {
            return;
          }

          self.player.moving = true;
        }
        break;

      case Packets.MovementOpcode.Step:
        {
          const x = message.shift();
          const y = message.shift();

          if (self.player.stunned || !self.preventNoClip(x, y)) return;

          self.player.setPosition(x, y);
        }
        break;

      case Packets.MovementOpcode.Stop:
        {
          const posX = message.shift();
          const posY = message.shift();
          const id = message.shift();
          const hasTarget = message.shift();
          const entity = self.world.getEntityByInstance(id);

          if (entity && entity.type === "item") {
            self.player.inventory.add(entity);
          }

          if (self.world.map.isDoor(posX, posY) && !hasTarget) {
            const destination = self.world.map.getDoorDestination(posX, posY);

            self.player.teleport(destination.x, destination.y, true);
          } else self.player.setPosition(posX, posY);

          self.player.moving = false;
          self.player.lastMovement = new Date().getTime();
        }
        break;

      case Packets.MovementOpcode.Entity:
        {
          const instance = message.shift();
          const entityX = message.shift();
          const entityY = message.shift();
          const oEntity = self.world.getEntityByInstance(instance);

          if (!oEntity || (oEntity.x === entityX && oEntity.y === entityY)) {
            return;
          }

          oEntity.setPosition(entityX, entityY);

          if (oEntity.hasTarget()) oEntity.combat.forceAttack();
        }
        break;

      case Packets.MovementOpcode.Orientate: {
        const orientation = message.shift();

        self.world.push(Packets.PushOpcode.Regions, {
          regionId: self.player.region,
          message: new Messages.Movement(Packets.MovementOpcode.Orientate, [
            self.player.instance,
            orientation
          ])
        });
      }
    }
  }

  handleRequest(message) {
    const self = this;
    const id = message.shift();

    if (id !== self.player.instance) return;

    self.world.region.push(self.player);
  }

  handleTarget(message) {
    const self = this;
    const opcode = message.shift();
    const instance = message.shift();

    log.debug("Targeted: " + instance);

    switch (opcode) {
      case Packets.TargetOpcode.Talk:
        {
          const entity = self.world.getEntityByInstance(instance);

          if (!entity || !self.player.isAdjacent(entity)) return;

          if (entity.type === "chest") {
            entity.openChest();
            return;
          }

          if (entity.dead) return;

          if (self.player.npcTalkCallback) self.player.npcTalkCallback(entity);
        }
        break;

      case Packets.TargetOpcode.Attack:
        {
          const target = self.world.getEntityByInstance(instance);

          if (!target || target.dead || !self.canAttack(self.player, target)) {
            return;
          }

          self.world.push(Packets.PushOpcode.Regions, {
            regionId: target.region,
            message: new Messages.Combat(Packets.CombatOpcode.Initiate, {
              attackerId: self.player.instance,
              targetId: target.instance
            })
          });
        }
        break;

      case Packets.TargetOpcode.None: {
        self.player.combat.stop();
        self.player.removeTarget();
      }
    }
  }

  handleCombat(message) {
    const self = this;
    const opcode = message.shift();

    switch (opcode) {
      case Packets.CombatOpcode.Initiate: {
        const attacker = self.world.getEntityByInstance(message.shift());
        const target = self.world.getEntityByInstance(message.shift());

        if (
          !target ||
          target.dead ||
          !attacker ||
          attacker.dead ||
          !self.canAttack(attacker, target)
        ) {
          return;
        }

        attacker.setTarget(target);

        if (!attacker.combat.started) attacker.combat.forceAttack();
        else {
          attacker.combat.start();

          attacker.combat.attack(target);
        }

        if (target.combat) target.combat.addAttacker(attacker);
      }
    }
  }

  handleProjectile(message) {
    const self = this;
    const type = message.shift();

    switch (type) {
      case Packets.ProjectileOpcode.Impact: {
        const projectile = self.world.getEntityByInstance(message.shift());
        const target = self.world.getEntityByInstance(message.shift());

        if (!target || target.dead || !projectile) return;

        self.world.handleDamage(projectile.owner, target, projectile.damage);
        self.world.removeProjectile(projectile);

        if (target.combat.started || target.dead || target.type !== "mob") {
          return;
        }

        target.begin(projectile.owner);
      }
    }
  }

  handleNetwork(message) {
    const self = this;
    const opcode = message.shift();

    switch (opcode) {
      case Packets.NetworkOpcode.Pong:
        log.info("Pingy pongy pung pong.");
    }
  }

  handleChat(message) {
    const self = this;
    const text = sanitizer.escape(sanitizer.sanitize(message.shift()));

    if (!text || text.length < 1 || !/\S/.test(text)) return;

    if (text.charAt(0) === "/" || text.charAt(0) === ";") {
      self.commands.parse(text);
    } else {
      if (self.player.isMuted()) {
        self.player.send(
          new Messages.Notification(
            Packets.NotificationOpcode.Text,
            "You are currently muted."
          )
        );
        return;
      }

      if (!self.player.canTalk) {
        self.player.send(
          new Messages.Notification(
            Packets.NotificationOpcode.Text,
            "You are not allowed to talk for the duration of this event."
          )
        );
        return;
      }

      log.info(`${self.player.name} - ${text}`);

      self.world.push(Packets.PushOpcode.Region, {
        regionId: self.player.region,
        message: new Messages.Chat({
          id: self.player.instance,
          name: self.player.username,
          withBubble: true,
          text: text,
          duration: 7000
        })
      });
    }
  }

  handleInventory(message) {
    const self = this;
    const opcode = message.shift();
    let id;

    switch (opcode) {
      case Packets.InventoryOpcode.Remove:
        {
          const item = message.shift();
          let count;

          if (!item) return;

          if (item.count > 1) count = message.shift();

          id = Items.stringToId(item.string);

          const iSlot = self.player.inventory.slots[item.index];

          if (count > iSlot.count) count = iSlot.count;

          if (
            self.player.inventory.remove(id, count || item.count, item.index)
          ) {
            self.world.dropItem(id, count || 1, self.player.x, self.player.y);
          }
        }
        break;

      case Packets.InventoryOpcode.Select: {
        const index = message.shift();
        const slot = self.player.inventory.slots[index];
        const string = slot.string;
        const sCount = slot.count;
        const ability = slot.ability;
        const abilityLevel = slot.abilityLevel;

        if (!slot) return;

        id = Items.stringToId(slot.string);

        if (slot.equippable) {
          if (!self.player.canEquip(string)) return;

          self.player.inventory.remove(id, slot.count, slot.index);

          self.player.equip(string, sCount, ability, abilityLevel);
        } else if (slot.edible) {
          self.player.inventory.remove(id, 1, slot.index);

          self.player.eat(id);
        }
      }
    }
  }

  handleBank(message) {
    const self = this;
    const opcode = message.shift();

    switch (opcode) {
      case Packets.BankOpcode.Select: {
        const type = message.shift();
        const index = message.shift();
        const isBank = type === "bank";

        if (isBank) {
          const bankSlot = self.player.bank.slots[index];

          // Infinite stacks move all at onces, otherwise move one by one.
          const moveAmount =
            Items.maxStackSize(bankSlot.id) === -1 ? bankSlot.count : 1;

          if (self.player.inventory.add(bankSlot, moveAmount)) {
            self.player.bank.remove(bankSlot.id, moveAmount, index);
          }
        } else {
          const inventorySlot = self.player.inventory.slots[index];

          if (
            self.player.bank.add(
              inventorySlot.id,
              inventorySlot.count,
              inventorySlot.ability,
              inventorySlot.abilityLevel
            )
          ) {
            self.player.inventory.remove(
              inventorySlot.id,
              inventorySlot.count,
              index
            );
          }
        }
      }
    }
  }

  handleRespawn(message) {
    const self = this;
    const instance = message.shift();

    if (self.player.instance !== instance) return;

    const spawn = self.player.getSpawn();

    self.player.dead = false;
    self.player.setPosition(spawn.x, spawn.y);

    self.world.push(Packets.PushOpcode.Regions, {
      regionId: self.player.region,
      message: new Messages.Spawn(self.player),
      ignoreId: self.player.instance
    });

    self.player.send(
      new Messages.Respawn(self.player.instance, self.player.x, self.player.y)
    );

    self.player.revertPoints();
  }

  handleTrade(message) {
    const self = this;
    const opcode = message.shift();
    const oPlayer = self.world.getEntityByInstance(message.shift());

    if (!oPlayer || !opcode) return;

    switch (opcode) {
      case Packets.TradeOpcode.Request:
        break;

      case Packets.TradeOpcode.Accept:
        break;

      case Packets.TradeOpcode.Decline:
    }
  }

  handleEnchant(message) {
    const self = this;
    const opcode = message.shift();

    switch (opcode) {
      case Packets.EnchantOpcode.Select:
        {
          const index = message.shift();
          const item = self.player.inventory.slots[index];
          let type = "item";

          if (Items.isShard(item.id)) type = "shards";

          self.player.enchant.add(type, item);
        }
        break;

      case Packets.EnchantOpcode.Remove:
        self.player.enchant.remove(message.shift());

        break;

      case Packets.EnchantOpcode.Enchant:
        self.player.enchant.enchant();
    }
  }

  handleClick(message) {
    const self = this;
    const type = message.shift();
    const isOpen = message.shift();

    switch (type) {
      case "profile":
        if (self.player.profileToggleCallback) {
          self.player.profileToggleCallback(isOpen);
        }
    }
  }

  handleWarp(message) {
    const self = this;
    const id = parseInt(message.shift()) - 1;

    if (self.player.warp) self.player.warp.warp(id);
  }

  handleShop(message) {
    const self = this;
    const opcode = message.shift();
    const shopId = message.shift();

    switch (opcode) {
      case Packets.ShopOpcode.Buy: {
        const buyId = message.shift();
        const amount = message.shift();

        if (!buyId || !amount) {
          self.player.notify("Incorrect purchase relay.");
          return;
        }

        log.info("Received Buy: " + buyId + " " + amount);
      }
      // self.world.shops.buy(self.player, shopId, buyId, amount);
    }
  }

  handleCamera(message) {
    const self = this;

    log.info(self.player.x + " " + self.player.y);

    self.player.cameraArea = null;
    self.player.handler.detectCamera(self.player.x, self.player.y);
  }

  canAttack(attacker, target) {
    /**
     * Used to prevent client-sided manipulation. The client will send the packet to start combat
     * but if it was modified by a presumed hacker, it will simply cease when it arrives to this condition.
     */

    if (attacker.type === "mob" || target.type === "mob") return true;

    return (
      attacker.type === "player" &&
      target.type === "player" &&
      attacker.pvp &&
      target.pvp
    );
  }

  preventNoClip(x, y) {
    const self = this;
    const isMapColliding = self.world.map.isColliding(x, y);
    const isInstanceColliding = self.player.doors.hasCollision(x, y);

    if (isMapColliding || isInstanceColliding) {
      self.player.stopMovement(true);
      self.player.notify(
        "We have detected no-clipping in your client. Please submit a bug report."
      );

      const x =
        self.player.previousX < 0 ? self.player.x : self.player.previousX;
      const y =
        self.player.previousY < 0 ? self.player.y : self.player.previousY;

      self.player.teleport(x, y, false, true);
      return false;
    }

    return true;
  }
}

module.exports = Incoming;
