define(["jquery"], function($) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;

      self.shortcuts = $("#abilityShortcut");
    },

    getList() {
      return this.shortcuts.find("ul");
    }
  });
});
