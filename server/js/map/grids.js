/* global module */

const _ = require("underscore");

class Grids {
  constructor(map) {
    const self = this;

    self.map = map;

    self.entityGrid = [];

    self.load();
  }

  load() {
    const self = this;

    for (let i = 0; i < self.map.height; i++) {
      self.entityGrid[i] = [];

      for (let j = 0; j < self.map.width; j++) self.entityGrid[i][j] = {};
    }
  }

  updateEntityPosition(entity) {
    const self = this;

    if (entity && entity.oldX === entity.x && entity.oldY === entity.y) return;

    self.removeFromEntityGrid(entity, entity.oldX, entity.oldY);
    self.addToEntityGrid(entity, entity.x, entity.y);

    entity.updatePosition();
  }

  addToEntityGrid(entity, x, y) {
    const self = this;

    if (
      entity &&
      x > 0 &&
      y > 0 &&
      x < self.map.width &&
      x < self.map.height &&
      self.entityGrid[y][x]
    ) {
      self.entityGrid[y][x][entity.instance] = entity;
    }
  }

  removeFromEntityGrid(entity, x, y) {
    const self = this;

    if (
      entity &&
      x > 0 &&
      y > 0 &&
      x < self.map.width &&
      y < self.map.height &&
      self.entityGrid[y][x] &&
      entity.instance in self.entityGrid[y][x]
    ) {
      delete self.entityGrid[y][x][entity.instance];
    }
  }

  getSurroundingEntities(entity, radius, include) {
    const self = this;
    const entities = [];

    if (!self.checkBounds(entity.x, entity.y, radius)) return;

    for (let i = -radius; i < radius + 1; i++) {
      for (let j = -radius; j < radius + 1; j++) {
        const pos = self.entityGrid[entity.y + i][entity.x + j];

        if (_.size(pos) > 0) {
          _.each(pos, function(pEntity) {
            if (!include && pEntity.instance !== entity.instance) {
              entities.push(pEntity);
            }
          });
        }
      }
    }

    return entities;
  }

  checkBounds(x, y, radius) {
    return (
      x + radius < this.map.width &&
      x - radius > 0 &&
      y + radius < this.map.height &&
      y - radius > 0
    );
  }
}

module.exports = Grids;
