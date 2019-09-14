define(["../../utils/timer"], function(Timer) {
  return Class.extend({
    init(id, element, duration) {
      const self = this;

      self.id = id;
      self.element = element;
      self.duration = duration || 5000;

      self.time = new Date().getTime();
      self.timer = new Timer(self.time, self.duration);
    },

    isOver(time) {
      return this.timer.isOver(time);
    },

    reset(time) {
      this.timer.time = time;
    },

    destroy() {
      $(this.element).remove();
    }
  });
});
