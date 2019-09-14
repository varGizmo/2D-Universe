define(function() {
  return Class.extend({
    init: function(start, duration) {
      const self = this;

      self.time = start;
      self.duration = duration;
    },

    isOver: function(time) {
      const self = this;
      let over = false;

      if (time - self.time > self.duration) {
        over = true;
        self.time = time;
      }

      return over;
    }
  });
});
