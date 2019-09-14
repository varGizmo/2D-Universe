define(["../character"], function(Character) {
  return Character.extend({
    init(id, kind) {
      const self = this;

      self._super(id, kind);

      self.index = 0;

      self.type = "npc";
    },

    talk(messages) {
      const self = this;
      const count = messages.length;
      let message;

      if (self.index > count) self.index = 0;

      if (self.index < count) message = messages[self.index];

      self.index++;

      return message;
    },

    idle() {
      this._super();
    },

    setSprite(sprite) {
      this._super(sprite);
    },

    setName(name) {
      this._super(name);
    },

    setGridPosition(x, y) {
      this._super(x, y);
    }
  });
});
