define(["jquery", "../renderer/pointers/pointer"], function($, Pointer) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;
      self.pointers = {};

      self.scale = self.getScale();

      self.container = $("#bubbles");
    },

    create(id, type) {
      const self = this;

      if (id in self.pointers) return;

      const element = $("<div id=\"" + id + "\" class=\"pointer\"></div>");

      self.setSize(element);

      self.container.append(element);

      self.pointers[id] = new Pointer(id, element, type);
    },

    resize() {
      const self = this;

      _.each(self.pointers, function(pointer) {
        switch (pointer.type) {
          case Modules.Pointers.Relative:
            const scale = self.getScale();
            const x = pointer.x;
            const y = pointer.y;
            let offsetX = 0;
            let offsetY = 0;

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

    setSize(element) {
      const self = this;

      self.updateScale();

      element.css({
        width: 16 + 16 * self.scale + "px",
        height: 16 + 16 * self.scale + "px",
        margin: "inherit",
        "margin-top": "-" + 6 * self.scale + "px",
        top: 10 * self.scale + "px",
        background: "url(\"img/" + self.scale + "/pointer.png\")"
      });
    },

    clean() {
      const self = this;

      _.each(self.pointers, function(pointer) {
        pointer.destroy();
      });

      self.pointers = {};
    },

    destroy(pointer) {
      const self = this;

      delete self.pointers[pointer.id];
      pointer.destroy();
    },

    set(pointer, posX, posY) {
      const self = this;

      self.updateScale();
      self.updateCamera();

      const tileSize = 16 * self.scale;
      const x = (posX - self.camera.x) * self.scale;
      const width = parseInt(pointer.element.css("width") + 24);
      const offset = width / 2 - tileSize / 2;
      let y;

      y = (posY - self.camera.y) * self.scale - tileSize;

      pointer.element.css("left", x - offset + "px");
      pointer.element.css("top", y + "px");
    },

    setToEntity(entity) {
      const self = this;
      const pointer = self.get(entity.id);

      if (!pointer) return;

      self.set(pointer, entity.x, entity.y);
    },

    setToPosition(id, x, y) {
      const self = this;
      const pointer = self.get(id);

      if (!pointer) return;

      pointer.setPosition(x, y);

      self.set(pointer, x, y);
    },

    setRelative(id, x, y) {
      const self = this;
      const pointer = self.get(id);

      if (!pointer) return;

      const scale = self.getScale();
      let offsetX = 0;
      let offsetY = 0;

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

    update() {
      const self = this;

      _.each(self.pointers, function(pointer) {
        switch (pointer.type) {
          case Modules.Pointers.Entity:
            const entity = self.game.entities.get(pointer.id);

            if (entity) self.setToEntity(entity);
            else self.destroy(pointer);

            break;

          case Modules.Pointers.Position:
            if (pointer.x !== -1 && pointer.y !== -1)
            { self.set(pointer, pointer.x, pointer.y); }

            break;
        }
      });
    },

    get(id) {
      const self = this;

      if (id in self.pointers) return self.pointers[id];

      return null;
    },

    updateScale() {
      this.scale = this.getDrawingScale();
    },

    updateCamera() {
      this.camera = this.game.renderer.camera;
    },

    getScale() {
      return this.game.getScaleFactor();
    },

    getDrawingScale() {
      return this.game.renderer.getDrawingScale();
    }
  });
});
