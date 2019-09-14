/* global Modules, log */

define(function() {
  return Class.extend({
    init: function(renderer) {
      const self = this;

      self.renderer = renderer;
      self.map = renderer.map;

      self.offset = 0.5;
      self.x = 0;
      self.y = 0;

      self.dX = 0;
      self.dY = 0;

      self.gridX = 0;
      self.gridY = 0;

      self.prevGridX = 0;
      self.prevGridY = 0;

      self.tileSize = self.renderer.tileSize;

      self.speed = 1;
      self.panning = false;
      self.centered = true;
      self.player = null;

      self.lockX = false;
      self.lockY = false;

      self.update();
    },

    update: function() {
      const self = this;
      const factor = self.renderer.getUpscale();

      self.gridWidth = 15 * factor;
      self.gridHeight = 8 * factor;

      self.borderX =
        self.map.width * self.tileSize - self.gridWidth * self.tileSize;
      self.borderY =
        self.map.height * self.tileSize - self.gridHeight * self.tileSize;
    },

    setPosition: function(x, y) {
      const self = this;

      self.x = x;
      self.y = y;

      self.prevGridX = self.gridX;
      self.prevGridY = self.gridY;

      self.gridX = Math.floor(x / 16);
      self.gridY = Math.floor(y / 16);
    },

    clip: function() {
      this.setGridPosition(Math.round(this.x / 16), Math.round(this.y / 16));
    },

    center: function() {
      const self = this;

      if (self.centered) return;

      self.centered = true;
      self.centreOn(self.player);

      self.renderer.verifyCentration();
    },

    decenter: function() {
      const self = this;

      if (!self.centered) return;

      self.clip();
      self.centered = false;

      self.renderer.verifyCentration();
    },

    setGridPosition: function(x, y) {
      const self = this;

      self.prevGridX = self.gridX;
      self.prevGridY = self.gridY;

      self.gridX = x;
      self.gridY = y;

      self.x = self.gridX * 16;
      self.y = self.gridY * 16;
    },

    setPlayer: function(player) {
      const self = this;

      self.player = player;

      self.centreOn(self.player);
    },

    handlePanning: function(direction) {
      const self = this;

      if (!self.panning) return;

      switch (direction) {
        case Modules.Keys.Up:
          self.setPosition(self.x, self.y - 1);
          break;

        case Modules.Keys.Down:
          self.setPosition(self.x, self.y + 1);
          break;

        case Modules.Keys.Left:
          self.setPosition(self.x - 1, self.y);
          break;

        case Modules.Keys.Right:
          self.setPosition(self.x + 1, self.y);
          break;
      }
    },

    centreOn: function(entity) {
      const self = this;

      if (!entity) return;

      const width = Math.floor(self.gridWidth / 2);
      const height = Math.floor(self.gridHeight / 2);
      const nextX = entity.x - width * self.tileSize;
      const nextY = entity.y - height * self.tileSize;

      if (nextX >= 0 && nextX <= self.borderX && !self.lockX) {
        self.x = nextX;
        self.gridX = Math.round(entity.x / 16) - width;
      } else self.offsetX(nextX);

      if (nextY >= 0 && nextY <= self.borderY && !self.lockY) {
        self.y = nextY;
        self.gridY = Math.round(entity.y / 16) - height;
      } else self.offsetY(nextY);
    },

    forceCentre: function(entity) {
      const self = this;

      if (!entity) return;

      const width = Math.floor(self.gridWidth / 2);
      const height = Math.floor(self.gridHeight / 2);

      self.x = entity.x - width * self.tileSize;
      self.gridX = Math.round(entity.x / 16) - width;

      self.y = entity.y - height * self.tileSize;
      self.gridY = Math.round(entity.y / 16) - height;
    },

    offsetX: function(nextX) {
      const self = this;

      if (nextX <= 16) {
        self.x = 0;
        self.gridX = 0;
      } else if (nextX >= self.borderX) {
        self.x = self.borderX;
        self.gridX = Math.round(self.borderX / 16);
      }
    },

    offsetY: function(nextY) {
      const self = this;

      if (nextY <= 16) {
        self.y = 0;
        self.gridY = 0;
      } else if (nextY >= self.borderY) {
        self.y = self.borderY;
        self.gridY = Math.round(self.borderY / 16);
      }
    },

    zone: function(direction) {
      const self = this;

      switch (direction) {
        case Modules.Orientation.Up:
          self.setGridPosition(self.gridX, self.gridY - self.gridHeight + 2);

          break;

        case Modules.Orientation.Down:
          self.setGridPosition(self.gridX, self.gridY + self.gridHeight - 2);

          break;

        case Modules.Orientation.Right:
          self.setGridPosition(self.gridX + self.gridWidth - 2, self.gridY);

          break;

        case Modules.Orientation.Left:
          self.setGridPosition(self.gridX - self.gridWidth + 2, self.gridY);

          break;
      }
    },

    forEachVisiblePosition: function(callback, offset) {
      const self = this;

      if (!offset) offset = 1;

      for (
        let y = self.gridY - offset, maxY = y + self.gridHeight + offset * 2;
        y < maxY;
        y++
      )
      { for (
        let x = self.gridX - offset, maxX = x + self.gridWidth + offset * 2;
        x < maxX;
        x++
      )
      { callback(x, y); } }
    }
  });
});
