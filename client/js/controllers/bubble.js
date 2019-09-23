/* global _ */

define(["jquery", "../renderer/bubbles/blob"], function($, Blob) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;
      self.bubbles = {};

      self.container = $("#bubbles");
    },

    create(id, message, duration) {
      const self = this;

      if (self.bubbles[id]) {
        self.bubbles[id].reset(time);
        $("#" + id + " p").html(message);
      } else {
        const element = $(
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

    setTo(entity) {
      const self = this;

      const bubble = self.get(entity.id);

      if (!bubble || !entity) return;

      const scale = self.game.renderer.getDrawingScale();
      const tileSize = 16 * scale;
      const x = (entity.x - self.game.getCamera().x) * scale;
      const width = parseInt(bubble.element.css("width")) + 24;
      const offset = width / 2 - tileSize / 2;
      const offsetY = 10;
      let y;

      y = (entity.y - self.game.getCamera().y) * scale - tileSize * 2 - offsetY;

      bubble.element.css(
        "left",
        x - offset + (2 + self.game.renderer.scale) + "px"
      );
      bubble.element.css("top", y + "px");
    },

    update(time) {
      const self = this;

      _.each(self.bubbles, function(bubble) {
        const entity = self.game.entities.get(bubble.id);

        if (entity) self.setTo(entity);

        if (bubble.isOver(time)) {
          bubble.destroy();
          delete self.bubbles[bubble.id];
        }
      });
    },

    get(id) {
      const self = this;

      if (id in self.bubbles) return self.bubbles[id];

      return null;
    },

    clean() {
      const self = this;

      _.each(self.bubbles, function(bubble) {
        bubble.destroy();
      });

      self.bubbles = {};
    },

    destroy(id) {
      const self = this;
      const bubble = self.get(id);

      if (!bubble) return;

      bubble.destroy();
      delete self.bubbles[id];
    }
  });
});
