define(function() {
  return Class.extend({
    init: function() {
      let self = this;

      self.startValue = 0;
      self.endValue = 0;
      self.duration = 0;
      self.inProgress = false;
    },

    start: function(
      currentTime,
      updateFunction,
      stopFunction,
      startValue,
      endValue,
      duration
    ) {
      let self = this;

      self.startTime = currentTime;
      self.updateFunction = updateFunction;
      self.stopFunction = stopFunction;
      self.startValue = startValue;
      self.endValue = endValue;
      self.duration = duration;

      self.inProgress = true;
      self.count = 0;
    },

    step: function(currentTime) {
      let self = this;

      if (!self.inProgress) return;

      if (self.count > 0) self.count--;
      else {
        let elapsed = currentTime - self.startTime;

        if (elapsed > self.duration) elapsed = self.duration;

        let diff = self.endValue - self.startValue,
          interval = Math.round(
            self.startValue + (diff / self.duration) * elapsed
          );

        if (elapsed === self.duration || interval === self.endValue) {
          self.stop();
          if (self.stopFunction) self.stopFunction();
        } else if (self.updateFunction) self.updateFunction(interval);
      }
    },

    restart: function(currentTime, startValue, endValue) {
      let self = this;

      self.start(
        currentTime,
        self.updateFunction,
        self.stopFunction,
        startValue,
        endValue,
        self.duration
      );
      self.step(currentTime);
    },

    stop: function() {
      this.inProgress = false;
    }
  });
});
