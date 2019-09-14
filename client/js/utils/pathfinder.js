/* global _, log */

define(["../lib/astar"], function(AStar) {
  return Class.extend({
    init: function(width, height) {
      const self = this;

      self.width = width;
      self.height = height;

      self.grid = null;
      self.blankGrid = [];
      self.ignores = [];

      self.load();
    },

    load: function() {
      const self = this;

      for (let i = 0; i < self.height; i++) {
        self.blankGrid[i] = [];

        for (let j = 0; j < self.width; j++) self.blankGrid[i][j] = 0;
      }

      log.info("Sucessfully loaded the pathfinder!");
    },

    find: function(grid, entity, x, y, incomplete) {
      const self = this;
      const start = [entity.gridX, entity.gridY];
      const end = [x, y];
      let path;

      self.grid = grid;
      self.applyIgnore(true);

      path = AStar(self.grid, start, end);

      if (path.length === 0 && incomplete)
      { path = self.findIncomplete(start, end); }

      return path;
    },

    findIncomplete: function(start, end) {
      const self = this;
      let incomplete = [];
      let perfect;
      let x;
      let y;

      perfect = AStar(self.blankGrid, start, end);

      for (let i = perfect.length - 1; i > 0; i--) {
        x = perfect[i][0];
        y = perfect[i][1];

        if (self.grid[y][x] === 0) {
          incomplete = AStar(self.grid, start, [x.y]);
          break;
        }
      }

      return incomplete;
    },

    applyIgnore: function(ignored) {
      const self = this;
      let x;
      let y;
      let g;

      _.each(self.ignores, function(entity) {
        x = entity.hasPath() ? entity.nextGridX : entity.gridX;
        y = entity.hasPath() ? entity.nextGridY : entity.gridY;

        if (x >= 0 && y >= 0) self.grid[y][x] = ignored ? 0 : 1;
      });
    },

    ignoreEntity: function(entity) {
      const self = this;

      if (!entity) return;

      self.ignores.push(entity);
    },

    clearIgnores: function() {
      const self = this;

      self.applyIgnore(false);
      self.ignores = [];
    }
  });
});
