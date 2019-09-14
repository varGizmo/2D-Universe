define(function() {
  return Class.extend({
    init(start, duration) {
      const self = this;

      self.time = start;
      self.duration = duration;
    },

    isOver(time) {
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
