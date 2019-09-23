/* global log, Detect */

define(["jquery", "../page"], function($, Page) {
  return Class.extend({
    // TODO - Hide crpyto mining option on mobiles and completely disable it.

    init(game) {
      const self = this;

      self.game = game;
      self.audio = game.audio;
      self.storage = game.storage;
      self.renderer = game.renderer;
      self.camera = game.renderer.camera;

      self.body = $("#settingsPage");
      self.button = $("#settingsButton");

      self.volume = $("#volume");
      self.sfx = $("#sfx");
      self.brightness = $("#brightness");

      self.info = $("#info");

      self.soundCheck = $("#soundCheck");
      self.cameraCheck = $("#cameraCheck");
      self.debugCheck = $("#debugCheck");
      self.centreCheck = $("#centreCheck");
      self.nameCheck = $("#nameCheck");
      self.levelCheck = $("#levelCheck");

      self.loaded = false;

      self.load();
    },

    load() {
      const self = this;

      if (self.loaded) return;

      self.volume.val(self.getMusicLevel());
      self.sfx.val(self.getSFXLevel());
      self.brightness.val(self.getBrightness());

      self.game.app.updateRange(self.volume);
      self.game.app.updateRange(self.sfx);
      self.game.app.updateRange(self.brightness);

      self.renderer.adjustBrightness(self.getBrightness());

      self.button.click(function() {
        self.game.interface.hideAll();

        self.button.toggleClass("active");

        if (self.isVisible()) self.hide();
        else self.show();
      });

      self.volume.on("input", function() {
        if (self.audio.song) self.audio.song.volume = this.value / 100;
      });

      self.brightness.on("input", function() {
        self.renderer.adjustBrightness(this.value);
      });

      self.volume.change(function() {
        self.setMusicLevel(this.value);
      });

      self.sfx.change(function() {
        self.setSFXLevel(this.value);
      });

      self.brightness.change(function() {
        self.setBrightness(this.value);
      });

      self.soundCheck.click(function() {
        const isActive = self.soundCheck.hasClass("active");

        self.setSound(!isActive);

        if (isActive) {
          self.audio.reset(self.audio.song);
          self.audio.song = null;

          self.soundCheck.removeClass("active");
        } else {
          self.audio.update();

          self.soundCheck.addClass("active");
        }
      });

      self.cameraCheck.click(function() {
        const active = self.cameraCheck.hasClass("active");

        if (active) self.renderer.camera.decenter();
        else self.renderer.camera.center();

        self.cameraCheck.toggleClass("active");

        self.setCamera(!active);
      });

      self.debugCheck.click(function() {
        const active = self.debugCheck.hasClass("active");

        self.debugCheck.toggleClass("active");

        self.renderer.debugging = !active;

        self.setDebug(!active);
      });

      self.centreCheck.click(function() {
        const active = self.centreCheck.hasClass("active");

        self.centreCheck.toggleClass("active");

        self.renderer.autoCentre = !active;

        self.setCentre(!active);
      });

      self.nameCheck.click(function() {
        const active = self.nameCheck.hasClass("active");

        self.nameCheck.toggleClass("active");

        self.renderer.drawNames = !active;

        self.setName(!active);
      });

      self.levelCheck.click(function() {
        const active = self.levelCheck.hasClass("active");

        self.levelCheck.toggleClass("active");

        self.renderer.drawLevels = !active;

        self.setName(!active);
      });

      if (self.getSound()) self.soundCheck.addClass("active");

      if (self.getCamera()) self.cameraCheck.addClass("active");
      else {
        self.camera.centered = false;
        self.renderer.verifyCentration();
      }

      if (self.getDebug()) {
        self.debugCheck.addClass("active");
        self.renderer.debugging = true;
      }

      if (self.getCentreCap()) self.centreCheck.addClass("active");

      if (self.getName()) self.nameCheck.addClass("active");
      else self.renderer.drawNames = false;

      if (self.getLevel()) self.levelCheck.addClass("active");
      else self.renderer.drawLevels = false;

      self.loaded = true;
    },

    show() {
      this.body.fadeIn("slow");
    },

    hide() {
      this.body.fadeOut("fast");
    },

    setMusicLevel(musicLevel) {
      const self = this;

      self.storage.data.settings.music = musicLevel;
      self.storage.save();
    },

    setSFXLevel(sfxLevel) {
      const self = this;

      self.storage.data.settings.sfx = sfxLevel;
      self.storage.save();
    },

    setBrightness(brightness) {
      const self = this;

      self.storage.data.settings.brightness = brightness;
      self.storage.save();
    },

    setSound(state) {
      const self = this;

      self.storage.data.settings.soundEnabled = state;
      self.storage.save();
    },

    setCamera(state) {
      const self = this;

      self.storage.data.settings.centerCamera = state;
      self.storage.save();
    },

    setDebug(state) {
      const self = this;

      self.storage.data.settings.debug = state;
      self.storage.save();
    },

    setCentre(state) {
      const self = this;

      self.storage.data.settings.autoCentre = state;
      self.storage.save();
    },

    setName(state) {
      const self = this;

      self.storage.data.settings.showNames = state;
      self.storage.save();
    },

    setLevel(state) {
      const self = this;

      self.storage.data.settings.showLevels = state;
      self.storage.save();
    },

    getMusicLevel() {
      return this.storage.data.settings.music;
    },

    getSFXLevel() {
      return this.storage.data.settings.sfx;
    },

    getBrightness() {
      return this.storage.data.settings.brightness;
    },

    getSound() {
      return this.storage.data.settings.soundEnabled;
    },

    getCamera() {
      return this.storage.data.settings.centerCamera;
    },

    getDebug() {
      return this.storage.data.settings.debug;
    },

    getCentreCap() {
      return this.storage.data.settings.autoCentre;
    },

    getName() {
      return this.storage.data.settings.showNames;
    },

    getLevel() {
      return this.storage.data.settings.showLevels;
    },

    isVisible() {
      return this.body.css("display") === "block";
    }
  });
});
