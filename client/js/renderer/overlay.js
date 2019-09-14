/* global log */

define(function() {
  return Class.extend({
    init: function(game) {
      const self = this;

      self.game = game;

      self.overlays = {};
      self.currentOverlay = null;

      self.load();
    },

    load: function() {
      const self = this;

      self.overlays["fog.png"] = self.loadOverlay("fog.png");
    },

    loadOverlay: function(overlayName) {
      const overlay = new Image();

      overlay.crossOrigin = "Anonymous";
      overlay.src = "img/overlays/" + overlayName;

      overlay.onload = function() {
        log.info("Loaded " + overlayName);
      };

      return overlay;
    },

    updateOverlay(overlay) {
      const self = this;

      if (overlay in self.overlays)
      { self.currentOverlay = self.overlays[overlay]; }
      else self.currentOverlay = overlay;
    },

    getFog: function() {
      return this.currentOverlay;
    }
  });
});
