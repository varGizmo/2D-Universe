/* global Modules */

define(function() {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;
      self.renderer = game.renderer;
      self.camera = game.camera;
      self.input = game.input;

      self.direction = null;
    },

    reset() {
      this.direction = null;
    },

    setUp() {
      this.direction = Modules.Orientation.Up;
    },

    setDown() {
      this.direction = Modules.Orientation.Down;
    },

    setRight() {
      this.direction = Modules.Orientation.Right;
    },

    setLeft() {
      this.direction = Modules.Orientation.Left;
    },

    getDirection() {
      return this.direction;
    }
  });
});
