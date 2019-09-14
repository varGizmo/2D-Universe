/* global _, Modules */

define(["jquery"], function($) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;

      self.mapFrame = $("#mapFrame");
      self.warp = $("#warpButton");
      self.close = $("#closeMapFrame");

      self.warpCount = 0;

      self.load();
    },

    load() {
      const self = this;
      const scale = self.getScale();

      self.warp.click(function() {
        self.toggle();
      });

      self.close.click(function() {
        self.hide();
      });

      for (let i = 1; i < 7; i++) {
        const warp = self.mapFrame.find("#warp" + i);

        if (warp)
        { warp.click(function(event) {
          self.hide();

          self.game.socket.send(Packets.Warp, [
            event.currentTarget.id.substring(4)
          ]);
        }); }
      }
    },

    toggle() {
      const self = this;

      /**
       * Just so it fades out nicely.
       */

      if (self.isVisible()) self.hide();
      else self.display();
    },

    getScale() {
      return this.game.getScaleFactor();
    },

    isVisible() {
      return this.mapFrame.css("display") === "block";
    },

    display() {
      this.mapFrame.fadeIn("slow");
    },

    hide() {
      this.mapFrame.fadeOut("fast");
    }
  });
});
