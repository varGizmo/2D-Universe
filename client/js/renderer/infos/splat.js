/* global Modules */

define(function() {
  return Class.extend({
    init: function(id, type, text, x, y, statique) {
      const self = this;

      self.id = id;
      self.type = type;
      self.text = text;
      self.x = x;
      self.y = y;

      self.statique = statique;

      self.opacity = 1.0;
      self.lastTime = 0;
      self.speed = 100;

      self.duration = 1000;
    },

    setColours: function(fill, stroke) {
      this.fill = fill;
      this.stroke = stroke;
    },

    setDuration: function(duration) {
      this.duration = duration;
    },

    tick: function() {
      const self = this;

      if (!self.statique) self.y -= 1;

      self.opacity -= 70 / self.duration;

      if (self.opacity < 0) self.destroy();
    },

    update: function(time) {
      const self = this;

      if (time - self.lastTime > self.speed) {
        self.lastTime = time;
        self.tick();
      }
    },

    destroy: function() {
      const self = this;

      if (self.destroyCallback) self.destroyCallback(self.id);
    },

    onDestroy: function(callback) {
      this.destroyCallback = callback;
    }
  });
});