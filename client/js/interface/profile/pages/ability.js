define(["jquery", "../page"], function($, Page) {
  return Page.extend({
    init: function(game) {
      let self = this;

      self._super("#skillPage");

      self.game = game;
    }
  });
});
