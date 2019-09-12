define(function() {
  return Class.extend({
    init: function(start, duration) {
      let self = this;

      self.time = start;
      self.duration = duration;
    },

    isOver: function(time) {
      let self = this,
        over = false;

      if (time - self.time > self.duration) {
        over = true;
        self.time = time;
      }

      return over;
    }
  });
});
