/* global log */

define(function() {
  return Class.extend({
    init(map) {
      const self = this;

      self.map = map;

      self.renderingGrid = [];
      self.pathingGrid = [];
      self.entityGrid = [];
      self.itemGrid = [];

      self.load();
    },

    load() {
      const self = this;

      for (let i = 0; i < self.map.height; i++) {
        self.renderingGrid[i] = [];
        self.pathingGrid[i] = [];
        self.entityGrid[i] = [];
        self.itemGrid[i] = [];

        for (let j = 0; j < self.map.width; j++) {
          self.renderingGrid[i][j] = {};
          self.pathingGrid[i][j] = self.map.grid[i][j];
          self.entityGrid[i][j] = {};
          self.itemGrid[i][j] = {};
        }
      }

      log.info("Finished loading preliminary grids.");
    },

    checkPathingGrid(player, xRadius, yRadius) {
      const self = this;

      for (let y = player.gridY - yRadius; y < player.gridY + yRadius; y++)
      { for (let x = player.gridX - xRadius; x < player.gridX + xRadius; x++)
      { if (
        !self.map.isColliding(x, y) &&
            _.size(self.entityGrid[y][x] === 0)
      )
      { self.removeFromPathingGrid(x, y); } } }
    },

    resetPathingGrid() {
      const self = this;

      self.pathingGrid = [];

      for (let i = 0; i < self.map.height; i++) {
        self.pathingGrid[i] = [];

        for (let j = 0; j < self.map.width; j++)
        { self.pathingGrid[i][j] = self.map.grid[i][j]; }
      }
    },

    addToRenderingGrid(entity, x, y) {
      const self = this;

      if (!self.map.isOutOfBounds(x, y))
      { self.renderingGrid[y][x][entity.id] = entity; }
    },

    addToPathingGrid(x, y) {
      this.pathingGrid[y][x] = 1;
    },

    addToEntityGrid(entity, x, y) {
      const self = this;

      if (entity && self.entityGrid[y][x])
      { self.entityGrid[y][x][entity.id] = entity; }
    },

    addToItemGrid(item, x, y) {
      const self = this;

      if (item && self.itemGrid[y][x]) self.itemGrid[y][x][item.id] = item;
    },

    removeFromRenderingGrid(entity, x, y) {
      const self = this;

      if (
        entity &&
        self.renderingGrid[y][x] &&
        entity.id in self.renderingGrid[y][x]
      )
      { delete self.renderingGrid[y][x][entity.id]; }
    },

    removeFromPathingGrid(x, y) {
      this.pathingGrid[y][x] = 0;
    },

    removeFromMapGrid(x, y) {
      this.map.grid[y][x] = 0;
    },

    removeFromEntityGrid(entity, x, y) {
      const self = this;

      if (entity && self.entityGrid[y][x] && entity.id in self.entityGrid[y][x])
      { delete self.entityGrid[y][x][entity.id]; }
    },

    removeFromItemGrid(item, x, y) {
      const self = this;

      if (item && self.itemGrid[y][x][item.id])
      { delete self.itemGrid[y][x][item.id]; }
    },

    removeEntity(entity) {
      const self = this;

      if (entity) {
        self.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
        self.removeFromPathingGrid(entity.gridX, entity.gridY);
        self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

        if (entity.nextGridX > -1 && entity.nextGridY > -1) {
          self.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
          self.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
        }
      }
    }
  });
});
