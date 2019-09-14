define(function() {
  return Class.extend({
    init(id, element, type) {
      const self = this;

      self.id = id;
      self.element = element;
      self.type = type;

      self.blinkInterval = null;
      self.visible = true;

      self.x = -1;
      self.y = -1;

      self.load();
    },

    load() {
      const self = this;

      self.blinkInterval = setInterval(function() {
        if (self.visible) self.hide();
        else self.show();

        self.visible = !self.visible;
      }, 600);
    },

    destroy() {
      const self = this;

      clearInterval(self.blinkInterval);
      self.element.remove();
    },

    setPosition(x, y) {
      const self = this;

      self.x = x;
      self.y = y;
    },

    show() {
      this.element.css("display", "block");
    },

    hide() {
      this.element.css("display", "none");
    }
  });
});
