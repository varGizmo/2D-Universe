/* global _ */

define(["jquery", "../renderer/bubbles/blob"], function($, Blob) {
  return Class.extend({
    init: function(game) {
      let self = this;

      self.game = game;
      self.bubbles = {};

      self.container = $("#bubbles");
    },

    create: function(id, message, duration) {
      let self = this;

      if (self.bubbles[id]) {
        self.bubbles[id].reset(Blob.time);
        $("#" + id + " p").html(message);
      } else {
        let element = $(
          "<div id='" +
            id +
            "' class='bubble'><p>" +
            message +
            "</p><div class='bubbleTip'></div></div>"
        );

        $(element).appendTo(self.container);

        self.bubbles[id] = new Blob(id, element, duration);

        return self.bubbles[id];
      }
    },

    setTo: function(entity) {
      let self = this;

      let bubble = self.get(entity.id);

      if (!bubble || !entity) return;

      let scale = self.game.renderer.getDrawingScale(),
        tileSize = 16 * scale,
        x = (entity.x - self.game.getCamera().x) * scale,
        width = parseInt(bubble.element.css("width")) + 24,
        offset = width / 2 - tileSize / 2,
        offsetY = 10,
        y;

      y = (entity.y - self.game.getCamera().y) * scale - tileSize * 2 - offsetY;

      bubble.element.css(
        "left",
        x - offset + (2 + self.game.renderer.scale) + "px"
      );
      bubble.element.css("top", y + "px");
    },

    update: function(time) {
      let self = this;

      _.each(self.bubbles, function(bubble) {
        let entity = self.game.entities.get(bubble.id);

        if (entity) self.setTo(entity);

        if (bubble.isOver(time)) {
          bubble.destroy();
          delete self.bubbles[bubble.id];
        }
      });
    },

    get: function(id) {
      let self = this;

      if (id in self.bubbles) return self.bubbles[id];

      return null;
    },

    clean: function() {
      let self = this;

      _.each(self.bubbles, function(bubble) {
        bubble.destroy();
      });

      self.bubbles = {};
    },

    destroy: function(id) {
      let self = this,
        bubble = self.get(id);

      if (!bubble) return;

      bubble.destroy();
      delete self.bubbles[id];
    }
  });
});
