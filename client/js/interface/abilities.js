define(["jquery"], function($) {
  return Class.extend({
    init: function(game) {
      const self = this;

      self.game = game;

      self.shortcuts = $("#abilityShortcut");
    },

    getList: function() {
      return this.shortcuts.find("ul");
    }
  });
});
