/* global log, _, Modules, Packets */

define([
  "../renderer/grids",
  "../entity/objects/chest",
  "../entity/character/character",
  "../entity/character/player/player",
  "../entity/objects/item",
  "./sprites",
  "../entity/character/mob/mob",
  "../entity/character/npc/npc",
  "../entity/objects/projectile"
], function(
  Grids,
  Chest,
  Character,
  Player,
  Item,
  Sprites,
  Mob,
  NPC,
  Projectile
) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;
      self.renderer = game.renderer;

      self.grids = null;
      self.sprites = null;

      self.entities = {};
      self.decrepit = {};
    },

    load() {
      const self = this;

      self.game.app.sendStatus("Loading sprites");

      if (!self.sprites) {
        self.sprites = new Sprites(self.game.renderer);

        self.sprites.onLoadedSprites(function() {
          self.game.input.loadCursors();
        });
      }

      self.game.app.sendStatus("Loading grids");

      if (!self.grids) self.grids = new Grids(self.game.map);
    },

    update() {
      const self = this;

      if (self.sprites) self.sprites.updateSprites();
    },

    create(info) {
      const self = this;
      let entity;

      if (self.isPlayer(info.id)) return;

      switch (info.type) {
        case "chest":
          /**
           * Here we will parse the different types of chests..
           * We can go Dark Souls style and implement mimics
           * the proper way -ahem- Gizmo V1.0
           */

          const chest = new Chest(info.id, info.string);

          entity = chest;

          break;

        case "npc":
          const npc = new NPC(info.id, info.string);

          entity = npc;

          break;

        case "item":
          const item = new Item(
            info.id,
            info.string,
            info.count,
            info.ability,
            info.abilityLevel
          );

          entity = item;

          break;

        case "mob":
          const mob = new Mob(info.id, info.string);

          mob.setHitPoints(info.hitPoints);
          mob.setMaxHitPoints(info.maxHitPoints);

          mob.attackRange = info.attackRange;
          mob.level = info.level;
          mob.hiddenName = info.hiddenName;

          entity = mob;

          break;

        case "projectile":
          const attacker = self.get(info.characterId);
          const target = self.get(info.targetId);

          if (!attacker || !target) return;

          attacker.lookAt(target);

          const projectile = new Projectile(
            info.id,
            info.projectileType,
            attacker
          );

          projectile.name = info.name;

          projectile.setStart(attacker.x, attacker.y);
          projectile.setTarget(target);

          projectile.setSprite(self.getSprite(projectile.name));
          projectile.setAnimation("travel", projectile.getSpeed());

          projectile.angled = true;
          projectile.type = info.type;

          /**
           * Move this into the external overall function
           */

          projectile.onImpact(function() {
            /**
             * The data in the projectile is only for rendering purposes
             * there is nothing you can change for the actual damage output here.
             */

            if (self.isPlayer(projectile.owner.id) || self.isPlayer(target.id))
            { self.game.socket.send(Packets.Projectile, [
              Packets.ProjectileOpcode.Impact,
              info.id,
              target.id
            ]); }

            if (info.hitType === Modules.Hits.Explosive)
            { target.explosion = true; }

            self.game.info.create(
              Modules.Hits.Damage,
              [info.damage, self.isPlayer(target.id)],
              target.x,
              target.y
            );

            target.triggerHealthBar();

            self.unregisterPosition(projectile);
            delete self.entities[projectile.getId()];
          });

          self.addEntity(projectile);

          attacker.performAction(attacker.orientation, Modules.Actions.Attack);
          attacker.triggerHealthBar();

          return;

        case "player":
          const player = new Player();

          player.setId(info.id);
          player.setName(info.name);
          player.setGridPosition(info.x, info.y);

          player.rights = info.rights;
          player.level = info.level;
          player.pvp = info.pvp;
          player.pvpKills = info.pvpKills;
          player.pvpDeaths = info.pvpDeaths;
          player.type = info.type;

          const hitPointsData = info.hitPoints;
          const manaData = info.mana;
          const equipments = [
            info.armour,
            info.weapon,
            info.pendant,
            info.ring,
            info.boots
          ];

          player.setHitPoints(hitPointsData[0]);
          player.setMaxHitPoints(hitPointsData[1]);

          player.setMana(manaData[0]);
          player.setMaxMana(manaData[1]);

          player.setSprite(self.getSprite(info.armour.string));
          player.idle();

          _.each(equipments, function(equipment) {
            player.setEquipment(
              equipment.type,
              equipment.name,
              equipment.string,
              equipment.count,
              equipment.ability,
              equipment.abilityLevel
            );
          });

          player.loadHandler(self.game);

          self.addEntity(player);

          return;
      }

      if (!entity) return;

      const sprite = self.getSprite(
        info.type === "item" ? "item-" + info.string : info.string
      );

      entity.setGridPosition(info.x, info.y);
      entity.setName(info.name);

      entity.setSprite(sprite);

      entity.setIdleSpeed(sprite.idleSpeed);

      entity.idle();
      entity.type = info.type;

      self.addEntity(entity);

      if (info.type !== "item" && entity.handler) {
        entity.handler.setGame(self.game);
        entity.handler.load();
      }

      /**
       * Get ready for errors!
       */
    },

    isPlayer(id) {
      return this.game.player.id === id;
    },

    get(id) {
      const self = this;

      if (id in self.entities) return self.entities[id];

      return null;
    },

    exists(id) {
      return id in this.entities;
    },

    removeEntity(entity) {
      const self = this;

      self.grids.removeFromPathingGrid(entity.gridX, entity.gridY);
      self.grids.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

      delete self.entities[entity.id];
    },

    clean(ids) {
      const self = this;

      ids = ids[0];

      _.each(self.entities, function(entity) {
        if (ids) {
          if (
            ids.indexOf(parseInt(entity.id)) < 0 &&
            entity.id !== self.game.player.id
          )
          { self.removeEntity(entity); }
        } else if (entity.id !== self.game.player.id) self.removeEntity(entity);
      });

      self.grids.resetPathingGrid();
    },

    clearPlayers(exception) {
      const self = this;

      _.each(self.entities, function(entity) {
        if (entity.id !== exception.id && entity.type === "player")
        { self.removeEntity(entity); }
      });

      self.grids.resetPathingGrid();
    },

    addEntity(entity) {
      const self = this;

      if (self.entities[entity.id]) return;

      self.entities[entity.id] = entity;
      self.registerPosition(entity);

      if (
        !(entity instanceof Item && entity.dropped) &&
        !self.renderer.isPortableDevice()
      )
      { entity.fadeIn(self.game.time); }
    },

    removeItem(item) {
      const self = this;

      if (!item) return;

      self.grids.removeFromItemGrid(item, item.gridX, item.gridY);
      self.grids.removeFromRenderingGrid(item, item.gridX, item.gridY);

      delete self.entities[item.id];
    },

    registerPosition(entity) {
      const self = this;

      if (!entity) return;

      if (
        entity.type === "player" ||
        entity.type === "mob" ||
        entity.type === "npc" ||
        entity.type === "chest"
      ) {
        self.grids.addToEntityGrid(entity, entity.gridX, entity.gridY);

        if (entity.type !== "player" || entity.nonPathable)
        { self.grids.addToPathingGrid(entity.gridX, entity.gridY); }
      }

      if (entity.type === "item")
      { self.grids.addToItemGrid(entity, entity.gridX, entity.gridY); }

      self.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);
    },

    registerDuality(entity) {
      const self = this;

      if (!entity) return;

      self.grids.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;

      self.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);

      if (entity.nextGridX > -1 && entity.nextGridY > -1) {
        self.grids.entityGrid[entity.nextGridY][entity.nextGridX][
          entity.id
        ] = entity;

        if (!(entity instanceof Player))
        { self.grids.pathingGrid[entity.nextGridY][entity.nextGridX] = 1; }
      }
    },

    unregisterPosition(entity) {
      const self = this;

      if (!entity) return;

      self.grids.removeEntity(entity);
    },

    getSprite(name) {
      return this.sprites.sprites[name];
    },

    getAll() {
      return this.entities;
    },

    forEachEntity(callback) {
      _.each(this.entities, function(entity) {
        callback(entity);
      });
    },

    forEachEntityAround(x, y, radius, callback) {
      const self = this;

      for (let i = x - radius, max_i = x + radius; i <= max_i; i++) {
        for (let j = y - radius, max_j = y + radius; j <= max_j; j++) {
          if (self.map.isOutOfBounds(i, j)) continue;

          _.each(self.grids.renderingGrid[j][i], function(entity) {
            callback(entity);
          });
        }
      }
    }
  });
});
