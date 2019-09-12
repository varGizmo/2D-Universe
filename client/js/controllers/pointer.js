define(["jquery", "../renderer/pointers/pointer"], function($, Pointer) {
  return Class.extend({
    init: function(game) {
      let self = this;

      self.game = game;
      self.pointers = {};

      self.scale = self.getScale();

      self.container = $("#bubbles");
    },

    create: function(id, type) {
      let self = this;

      if (id in self.pointers) return;

      let element = $('<div id="' + id + '" class="pointer"></div>');

      self.setSize(element);

      self.container.append(element);

      self.pointers[id] = new Pointer(id, element, type);
    },

    resize: function() {
      let self = this;

      _.each(self.pointers, function(pointer) {
        switch (pointer.type) {
          case Modules.Pointers.Relative:
            let scale = self.getScale(),
              x = pointer.x,
              y = pointer.y,
              offsetX = 0,
              offsetY = 0;

            if (scale === 1) {
              offsetX = pointer.element.width() / 2 + 5;
              offsetY = pointer.element.height() / 2 - 4;
            }

            pointer.element.css("left", x * scale - offsetX + "px");
            pointer.element.css("top", y * scale - offsetY + "px");

            break;
        }
      });
    },

    setSize: function(element) {
      let self = this;

      self.updateScale();

      element.css({
        width: 16 + 16 * self.scale + "px",
        height: 16 + 16 * self.scale + "px",
        margin: "inherit",
        "margin-top": "-" + 6 * self.scale + "px",
        top: 10 * self.scale + "px",
        background: 'url("img/' + self.scale + '/pointer.png")'
      });
    },

    clean: function() {
      let self = this;

      _.each(self.pointers, function(pointer) {
        pointer.destroy();
      });

      self.pointers = {};
    },

    destroy: function(pointer) {
      let self = this;

      delete self.pointers[pointer.id];
      pointer.destroy();
    },

    set: function(pointer, posX, posY) {
      let self = this;

      self.updateScale();
      self.updateCamera();

      let tileSize = 16 * self.scale,
        x = (posX - self.camera.x) * self.scale,
        width = parseInt(pointer.element.css("width") + 24),
        offset = width / 2 - tileSize / 2,
        y;

      y = (posY - self.camera.y) * self.scale - tileSize;

      pointer.element.css("left", x - offset + "px");
      pointer.element.css("top", y + "px");
    },

    setToEntity: function(entity) {
      let self = this,
        pointer = self.get(entity.id);

      if (!pointer) return;

      self.set(pointer, entity.x, entity.y);
    },

    setToPosition: function(id, x, y) {
      let self = this,
        pointer = self.get(id);

      if (!pointer) return;

      pointer.setPosition(x, y);

      self.set(pointer, x, y);
    },

    setRelative: function(id, x, y) {
      let self = this,
        pointer = self.get(id);

      if (!pointer) return;

      let scale = self.getScale(),
        offsetX = 0,
        offsetY = 0;

      /**
       * Must be set in accordance to the lowest scale.
       */

      if (scale === 1) {
        offsetX = pointer.element.width() / 2 + 5;
        offsetY = pointer.element.height() / 2 - 4;
      }

      pointer.setPosition(x, y);

      pointer.element.css("left", x * scale - offsetX + "px");
      pointer.element.css("top", y * scale - offsetY + "px");
    },

    update: function() {
      let self = this;

      _.each(self.pointers, function(pointer) {
        switch (pointer.type) {
          case Modules.Pointers.Entity:
            let entity = self.game.entities.get(pointer.id);

            if (entity) self.setToEntity(entity);
            else self.destroy(pointer);

            break;

          case Modules.Pointers.Position:
            if (pointer.x !== -1 && pointer.y !== -1)
              self.set(pointer, pointer.x, pointer.y);

            break;
        }
      });
    },

    get: function(id) {
      let self = this;

      if (id in self.pointers) return self.pointers[id];

      return null;
    },

    updateScale: function() {
      this.scale = this.getDrawingScale();
    },

    updateCamera: function() {
      this.camera = this.game.renderer.camera;
    },

    getScale: function() {
      return this.game.getScaleFactor();
    },

    getDrawingScale: function() {
      return this.game.renderer.getDrawingScale();
    }
  });
});
