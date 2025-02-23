/* global Modules, log, _, Detect, Packets */

define(["jquery", "../entity/animation", "./chat", "./overlay"], function(
  $,
  Animation,
  Chat,
  Overlay
) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;
      self.app = game.app;
      self.renderer = game.renderer;

      self.selectedCellVisible = false;
      self.previousClick = {};
      self.cursorVisible = true;
      self.targetVisible = true;
      self.selectedX = -1;
      self.selectedY = -1;

      self.cursor = null;
      self.newCursor = null;

      self.targetData = null;
      self.targetColour = null;
      self.newTargetColour = null;
      self.mobileTargetColour = "rgba(51, 255, 0)";

      self.keyMovement = true;
      self.cursorMoved = false;

      self.previousKey = {};

      self.cursors = {};

      self.lastMousePosition = { x: 0, y: 0 };

      self.hovering = null;

      self.mouse = {
        x: 0,
        y: 0
      };

      self.load();
    },

    load() {
      const self = this;

      /**
       * This is the animation for the target
       * cell spinner sprite (only on desktop)
       */

      self.targetAnimation = new Animation("move", 4, 0, 16, 16);
      self.targetAnimation.setSpeed(50);

      self.chatHandler = new Chat(self.game);
      self.overlay = new Overlay(self);
    },

    loadCursors() {
      const self = this;

      self.cursors.hand = self.game.getSprite("hand");
      self.cursors.sword = self.game.getSprite("sword");
      self.cursors.loot = self.game.getSprite("loot");
      self.cursors.target = self.game.getSprite("target");
      self.cursors.arrow = self.game.getSprite("arrow");
      self.cursors.talk = self.game.getSprite("talk");
      self.cursors.spell = self.game.getSprite("spell");
      self.cursors.bow = self.game.getSprite("bow");

      self.newCursor = self.cursors.hand;
      self.newTargetColour = "rgba(255, 255, 255, 0.5)";

      log.info("Loaded Cursors!");
    },

    handle(inputType, data) {
      const self = this;
      const player = self.getPlayer();

      switch (inputType) {
        case Modules.InputType.Key:
          if (self.chatHandler.isActive()) {
            self.chatHandler.key(data);
            return;
          }

          switch (data) {
            case Modules.Keys.W:
            case Modules.Keys.Up:
              self.getPlayer().moveUp = true;

              break;

            case Modules.Keys.A:
            case Modules.Keys.Left:
              self.getPlayer().moveLeft = true;

              break;

            case Modules.Keys.S:
            case Modules.Keys.Down:
              self.getPlayer().moveDown = true;

              break;

            case Modules.Keys.D:
            case Modules.Keys.Right:
              self.getPlayer().moveRight = true;

              break;

            case Modules.Keys.Enter:
              self.chatHandler.toggle();

              break;
          }

          break;

        case Modules.InputType.LeftClick:
          player.disableAction = false;
          self.keyMovement = false;

          self.setCoords(data);
          self.click(self.getCoords());

          break;
      }
    },

    keyUp(key) {
      const self = this;
      const player = self.getPlayer();

      switch (key) {
        case Modules.Keys.W:
        case Modules.Keys.Up:
          player.moveUp = false;
          break;

        case Modules.Keys.A:
        case Modules.Keys.Left:
          player.moveLeft = false;
          break;

        case Modules.Keys.S:
        case Modules.Keys.Down:
          player.moveDown = false;
          break;

        case Modules.Keys.D:
        case Modules.Keys.Right:
          player.moveRight = false;
          break;
      }

      player.disableAction = false;
    },

    keyMove(position) {
      const self = this;
      const player = self.getPlayer();

      if (!player.hasPath()) {
        self.keyMovement = true;
        self.cursorMoved = false;

        self.click(position);
      }
    },

    click(position) {
      const self = this;
      const player = self.getPlayer();

      if (player.stunned) return;

      self.setPassiveTarget();

      /**
       * It can be really annoying having the chat open
       * on mobile, and it is far harder to control.
       */

      if (
        self.renderer.mobile &&
        self.chatHandler.input.is(":visible") &&
        self.chatHandler.input.val() === ""
      )
      { self.chatHandler.hideInput(); }

      if (self.game.zoning && self.game.zoning.direction) return;

      const entity = self.game.getEntityAt(
        position.x,
        position.y,
        position.x === player.gridX && position.y === player.gridY
      );

      if (entity && !player.disableAction) {
        player.disableAction = true;

        self.setAttackTarget();

        if (self.isTargetable(entity)) player.setTarget(entity);

        if (
          player.getDistance(entity) < 7 &&
          player.isRanged() &&
          self.isAttackable(entity)
        ) {
          self.game.socket.send(Packets.Target, [
            Packets.TargetOpcode.Attack,
            entity.id
          ]);
          player.lookAt(entity);
          return;
        }

        if (entity.gridX === player.gridX && entity.gridY === player.gridY)
        { self.game.socket.send(Packets.Target, [
          Packets.TargetOpcode.Attack,
          entity.id
        ]); }

        /* if (entity.type === 'player') {
                    self.getActions().showPlayerActions(entity, self.mouse.x, self.mouse.y);
                    return;
                } */

        if (self.isTargetable(entity)) {
          player.follow(entity);
          return;
        }
      } else player.removeTarget();

      self.getActions().hidePlayerActions();

      player.go(position.x, position.y);

      if (self.game.interface) self.game.interface.hideAll();

      if (!self.game.audio.song && Detect.isSafari()) self.game.audio.update();
    },

    updateCursor() {
      const self = this;

      if (!self.cursorVisible) return;

      if (self.newCursor !== self.cursor) self.cursor = self.newCursor;

      if (self.newTargetColour !== self.targetColour)
      { self.targetColour = self.newTargetColour; }
    },

    moveCursor() {
      const self = this;

      if (!self.renderer || self.renderer.mobile || !self.renderer.camera)
      { return; }

      const position = self.getCoords();
      const player = self.getPlayer();
      const entity = self.game.getEntityAt(
        position.x,
        position.y,
        player.gridX === position.x && player.gridY === position.y
      );

      self.overlay.update(entity);

      if (!entity || entity.id === player.id || entity.type === "player") {
        self.setCursor(self.cursors.hand);
        self.hovering = null;
      } else {
        switch (entity.type) {
          case "item":
          case "chest":
            self.setCursor(self.cursors.loot);
            self.hovering = Modules.Hovering.Item;
            break;

          case "mob":
            self.setCursor(self.getAttackCursor());
            self.hovering = Modules.Hovering.Mob;
            break;

          case "npc":
            self.setCursor(self.cursors.talk);
            self.hovering = Modules.Hovering.NPC;
            break;
        }
      }
    },

    setPosition(x, y) {
      const self = this;

      self.selectedX = x;
      self.selectedY = y;
    },

    setCoords(event) {
      const self = this;
      const offset = self.app.canvas.offset();
      const width = self.renderer.background.width;
      const height = self.renderer.background.height;
      const proportionality = self.renderer.drawingScale === 3 ? 2 / 3 : 1;

      self.cursorMoved = false;

      self.mouse.x =
        Math.round((event.pageX - offset.left) / self.app.getZoom()) *
        proportionality;
      self.mouse.y =
        Math.round((event.pageY - offset.top) / self.app.getZoom()) *
        proportionality;

      if (self.mouse.x >= width) self.mouse.x = width - 1;
      else if (self.mouse.x <= 0) self.mouse.x = 0;

      if (self.mouse.y >= height) self.mouse.y = height - 1;
      else if (self.mouse.y <= 0) self.mouse.y = 0;
    },

    setCursor(cursor) {
      const self = this;

      if (cursor) self.newCursor = cursor;
      else log.error("Cursor: " + cursor + " could not be found.");
    },

    setAttackTarget() {
      const self = this;

      self.targetAnimation.setRow(1);
      self.mobileTargetColour = "rgb(255, 51, 0)";
    },

    setPassiveTarget() {
      const self = this;

      self.targetAnimation.setRow(0);
      self.mobileTargetColour = "rgb(51, 255, 0)";
    },

    getAttackCursor() {
      return this.cursors[this.getPlayer().isRanged() ? "bow" : "sword"];
    },

    getCoords() {
      const self = this;

      if (!self.renderer || !self.renderer.camera) return;

      const tileScale = self.renderer.tileSize * self.renderer.getSuperScaling();
      const offsetX = self.mouse.x % tileScale;
      const offsetY = self.mouse.y % tileScale;
      const x = (self.mouse.x - offsetX) / tileScale + self.game.getCamera().gridX;
      const y = (self.mouse.y - offsetY) / tileScale + self.game.getCamera().gridY;

      return {
        x: x,
        y: y
      };
    },

    getTargetData() {
      const self = this;
      const frame = self.targetAnimation.currentFrame;
      const superScale = self.renderer.getSuperScaling();
      const sprite = self.game.getSprite("target");

      if (!sprite.loaded) sprite.load();

      return (self.targetData = {
        sprite: sprite,
        x: frame.x * superScale,
        y: frame.y * superScale,
        width: sprite.width * superScale,
        height: sprite.height * superScale,
        dx: self.selectedX * 16 * superScale,
        dy: self.selectedY * 16 * superScale,
        dw: sprite.width * superScale,
        dh: sprite.height * superScale
      });
    },

    isTargetable(entity) {
      return (
        this.isAttackable(entity) ||
        entity.type === "npc" ||
        entity.type === "chest"
      );
    },

    isAttackable(entity) {
      return (
        entity.type === "mob" ||
        (entity.type === "player" && entity.pvp && this.game.pvp)
      );
    },

    getPlayer() {
      return this.game.player;
    },

    getActions() {
      return this.game.interface.actions;
    }
  });
});
