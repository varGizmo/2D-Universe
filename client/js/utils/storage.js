define(function() {
  const storage = window.localStorage;
  const name = "data";

  return Class.extend({
    init(app) {
      const self = this;

      self.app = app;
      self.data = null;

      self.load();
    },

    load() {
      const self = this;

      if (storage.data) self.data = JSON.parse(storage.getItem(name));
      else self.data = self.create();

      if (self.data.clientVersion !== self.app.config.version) {
        self.data = self.create();
        self.save();
      }
    },

    create() {
      return {
        new: true,
        clientVersion: this.app.config.version,

        player: {
          username: "",
          password: "",
          autoLogin: false,
          rememberMe: false,
          orientation: Modules.Orientation.Down
        },

        settings: {
          music: 100,
          sfx: 100,
          brightness: 100,
          soundEnabled: true,
          FPSCap: true,
          centerCamera: true,
          debug: false,
          showNames: true,
          showLevels: true
        },

        map: {
          regionData: [],
          collisions: []
        }
      };
    },

    save() {
      if (this.data) storage.setItem(name, JSON.stringify(this.data));
    },

    clear() {
      storage.removeItem(name);
      this.data = this.create();
    },

    toggleRemember(toggle) {
      const self = this;

      self.data.player.rememberMe = toggle;
      self.save();
    },

    setOrientation(orientation) {
      const self = this;
      const player = self.getPlayer();

      player.orientation = orientation;

      self.save();
    },

    setPlayer(option, value) {
      const self = this;
      const pData = self.getPlayer();

      if (pData.hasOwnProperty(option)) pData[option] = value;

      self.save();
    },

    setSettings(option, value) {
      const self = this;
      const sData = self.getSettings();

      if (sData.hasOwnProperty(option)) sData[option] = value;

      self.save();
    },

    setRegionData(regionData, collisionData) {
      const self = this;

      self.data.map.regionData = regionData;
      self.data.map.collisions = collisionData;

      self.save();
    },

    getPlayer() {
      return this.data.player;
    },

    getSettings() {
      return this.data ? this.data.settings : null;
    },

    getRegionData() {
      return this.data.map.regionData;
    },

    getCollisions() {
      return this.data.map.collisions;
    }
  });
});
