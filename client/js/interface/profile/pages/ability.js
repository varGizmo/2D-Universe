define(["jquery", "../page"], function($, Page) {
  return Page.extend({
    init(game) {
      const self = this;

      self._super("#skillPage");

      self.game = game;
    }
  });
});
