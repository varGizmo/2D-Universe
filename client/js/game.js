/* global Class, log, Packets, Modules, Detect, _ */

define([
  "./renderer/renderer",
  "./utils/storage",
  "./map/map",
  "./network/socket",
  "./entity/character/player/player",
  "./renderer/updater",
  "./controllers/entities",
  "./controllers/input",
  "./entity/character/player/playerhandler",
  "./utils/pathfinder",
  "./controllers/zoning",
  "./controllers/info",
  "./controllers/bubble",
  "./controllers/interface",
  "./controllers/audio",
  "./controllers/pointer",
  "./renderer/overlay",
  "./network/connection",
  "./utils/modules",
  "./network/packets"
], function(
  Renderer,
  LocalStorage,
  Map,
  Socket,
  Player,
  Updater,
  Entities,
  Input,
  PlayerHandler,
  Pathfinder,
  Zoning,
  Info,
  Bubble,
  Interface,
  Audio,
  Pointer,
  Overlay,
  Connection
) {
  return Class.extend({
    init(app) {
      const self = this;

      self.app = app;

      self.id = -1;

      self.socket = null;
      self.messages = null;
      self.renderer = null;
      self.updater = null;
      self.storage = null;
      self.entities = null;
      self.input = null;
      self.map = null;
      self.playerHandler = null;
      self.pathfinder = null;
      self.zoning = null;
      self.info = null;
      self.interface = null;
      self.audio = null;

      self.player = null;

      self.stopped = false;
      self.started = false;
      self.ready = false;
      self.loaded = false;

      self.time = new Date();

      self.pvp = false;
      self.population = -1;

      self.lastTime = new Date().getTime();

      self.loadRenderer();
      self.loadControllers();
    },

    start() {
      const self = this;

      if (self.started) return;

      self.app.fadeMenu();
      self.tick();

      self.started = true;
    },

    stop() {
      const self = this;

      self.stopped = false;
      self.started = false;
      self.ready = false;
    },

    tick() {
      const self = this;

      if (self.ready) {
        self.time = new Date().getTime();

        self.renderer.render();
        self.updater.update();

        if (!self.stopped) requestAnimationFrame(self.tick.bind(self));
      }
    },

    unload() {
      const self = this;

      self.socket = null;
      self.messages = null;
      self.renderer = null;
      self.updater = null;
      self.storage = null;
      self.entities = null;
      self.input = null;
      self.map = null;
      self.playerHandler = null;
      self.player = null;
      self.pathfinder = null;
      self.zoning = null;
      self.info = null;
      self.interface = null;

      self.audio.stop();
      self.audio = null;
    },

    loadRenderer() {
      const self = this;
      const background = document.getElementById("background");
      const foreground = document.getElementById("foreground");
      const overlay = document.getElementById("overlay");
      const textCanvas = document.getElementById("textCanvas");
      const entities = document.getElementById("entities");
      const cursor = document.getElementById("cursor");

      self.app.sendStatus("Initializing render engine");

      self.setRenderer(
        new Renderer(
          background,
          entities,
          foreground,
          overlay,
          textCanvas,
          cursor,
          self
        )
      );
    },

    loadControllers() {
      const self = this;
      const hasWorker = self.app.hasWorker();

      self.app.sendStatus("Loading local storage");

      self.setStorage(new LocalStorage(self.app));

      self.app.sendStatus(hasWorker ? "Loading maps - asynchronous" : null);

      if (hasWorker) self.loadMap();

      self.app.sendStatus("Initializing network socket");

      self.setSocket(new Socket(self));
      self.setMessages(self.socket.messages);
      self.setInput(new Input(self));

      self.app.sendStatus("Loading controllers");

      self.setEntityController(new Entities(self));

      self.setInfo(new Info(self));

      self.setBubble(new Bubble(self));

      self.setPointer(new Pointer(self));

      self.setAudio(new Audio(self));

      self.setInterface(new Interface(self));

      self.implementStorage();

      if (!hasWorker) {
        self.app.sendStatus(null);
        self.loaded = true;
      }
    },

    loadMap() {
      const self = this;

      self.map = new Map(self);
      self.overlays = new Overlay(self);

      self.map.onReady(function() {
        self.map.loadRegionData();

        self.app.sendStatus("Loading the pathfinder");

        self.setPathfinder(new Pathfinder(self.map.width, self.map.height));

        self.renderer.setMap(self.map);
        self.renderer.loadCamera();

        self.app.sendStatus("Loading updater");

        self.setUpdater(new Updater(self));

        self.entities.load();

        self.renderer.setEntities(self.entities);

        self.app.sendStatus(null);

        self.loaded = true;
      });
    },

    connect() {
      const self = this;

      self.app.cleanErrors();

      setTimeout(function() {
        self.socket.connect();
      }, 1000);

      self.connectionHandler = new Connection(self);
    },

    postLoad() {
      const self = this;

      /**
       * Call this after the player has been welcomed
       * by the server and the client received the connection.
       */

      self.renderer.loadStaticSprites();

      self.getCamera().setPlayer(self.player);

      self.renderer.renderedFrame[0] = -1;

      self.entities.addEntity(self.player);

      const defaultSprite = self.getSprite(self.player.getSpriteName());

      self.player.setSprite(defaultSprite);
      self.player.setOrientation(self.storage.data.player.orientation);
      self.player.idle();

      self.socket.send(Packets.Ready, [true, self.map.preloadedData]);

      self.playerHandler = new PlayerHandler(self, self.player);

      self.renderer.updateAnimatedTiles();

      self.zoning = new Zoning(self);

      self.updater.setSprites(self.entities.sprites);

      self.renderer.verifyCentration();

      self.renderer.addLight(0, 0, 12, 0.1, "rgba(0,0,0,0.4)", true);

      if (self.storage.data.new) {
        self.storage.data.new = false;
        self.storage.save();
      }
    },

    implementStorage() {
      const self = this;
      const loginName = $("#loginNameInput");
      const loginPassword = $("#loginPasswordInput");

      loginName.prop("readonly", false);
      loginPassword.prop("readonly", false);

      if (!self.hasRemember()) return;

      if (self.getStorageUsername() !== "") {
        loginName.val(self.getStorageUsername());
      }

      if (self.getStoragePassword() !== "") {
        loginPassword.val(self.getStoragePassword());
      }

      $("#rememberMe").addClass("active");
    },

    setPlayerMovement(direction) {
      this.player.direction = direction;
    },

    movePlayer(x, y) {
      this.moveCharacter(this.player, x, y);
    },

    moveCharacter(character, x, y) {
      if (!character) return;

      character.go(x, y);
    },

    findPath(character, x, y, ignores) {
      const self = this;
      const grid = self.entities.grids.pathingGrid;
      let path = [];

      if (self.map.isColliding(x, y) || !self.pathfinder || !character) {
        return path;
      }

      if (ignores) {
        _.each(ignores, function(entity) {
          self.pathfinder.ignoreEntity(entity);
        });
      }

      path = self.pathfinder.find(grid, character, x, y, false);

      if (ignores) self.pathfinder.clearIgnores();

      return path;
    },

    onInput(inputType, data) {
      this.input.handle(inputType, data);
    },

    handleDisconnection(noError) {
      const self = this;

      /**
       * This function is responsible for handling sudden
       * disconnects of a player whilst in the game, not
       * menu-based errors.
       */

      if (!self.started) return;

      self.stop();
      self.renderer.stop();

      self.unload();

      self.app.showMenu();

      if (noError) {
        self.app.sendError(null, "You have been disconnected from the server");
        self.app.statusMessage = null;
      }

      self.loadRenderer();
      self.loadControllers();

      self.app.toggleLogin(false);
      self.app.updateLoader("");
    },

    respawn() {
      const self = this;

      self.audio.play(Modules.AudioTypes.SFX, "revive");
      self.app.body.removeClass("death");

      self.socket.send(Packets.Respawn, [self.player.id]);
    },

    tradeWith(player) {
      const self = this;

      if (!player || player.id === self.player.id) return;

      self.socket.send(Packets.Trade, [Packets.TradeOpcode.Request, player.id]);
    },

    resize() {
      const self = this;

      self.renderer.resize();

      if (self.pointer) self.pointer.resize();
    },

    createPlayer() {
      this.player = new Player();
    },

    getScaleFactor() {
      return this.app.getScaleFactor();
    },

    getStorage() {
      return this.storage;
    },

    getCamera() {
      return this.renderer.camera;
    },

    getSprite(spriteName) {
      return this.entities.getSprite(spriteName);
    },

    getEntityAt(x, y, ignoreSelf) {
      const self = this;
      const entities = self.entities.grids.renderingGrid[y][x];

      if (_.size(entities) > 0) {
        return entities[_.keys(entities)[ignoreSelf ? 1 : 0]];
      }

      const items = self.entities.grids.itemGrid[y][x];

      if (_.size(items) > 0) {
        _.each(items, function(item) {
          if (item.stackable) return item;
        });

        return items[_.keys(items)[0]];
      }
    },

    getStorageUsername() {
      return this.storage.data.player.username;
    },

    getStoragePassword() {
      return this.storage.data.player.password;
    },

    hasRemember() {
      return this.storage.data.player.rememberMe;
    },

    setRenderer(renderer) {
      if (!this.renderer) this.renderer = renderer;
    },

    setStorage(storage) {
      if (!this.storage) this.storage = storage;
    },

    setSocket(socket) {
      if (!this.socket) this.socket = socket;
    },

    setMessages(messages) {
      if (!this.messages) this.messages = messages;
    },

    setUpdater(updater) {
      if (!this.updater) this.updater = updater;
    },

    setEntityController(entities) {
      if (!this.entities) this.entities = entities;
    },

    setInput(input) {
      const self = this;

      if (!self.input) {
        self.input = input;
        self.renderer.setInput(self.input);
      }
    },

    setPathfinder(pathfinder) {
      if (!this.pathfinder) this.pathfinder = pathfinder;
    },

    setInfo(info) {
      if (!this.info) this.info = info;
    },

    setBubble(bubble) {
      if (!this.bubble) this.bubble = bubble;
    },

    setPointer(pointer) {
      if (!this.pointer) this.pointer = pointer;
    },

    setInterface(intrface) {
      if (!this.interface) this.interface = intrface;
    },

    setAudio(audio) {
      if (!this.audio) this.audio = audio;
    }
  });
});
