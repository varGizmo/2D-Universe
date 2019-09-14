define(function() {
  return Class.extend({
    init() {
      const self = this;

      self.startValue = 0;
      self.endValue = 0;
      self.duration = 0;
      self.inProgress = false;
    },

    start(
      currentTime,
      updateFunction,
      stopFunction,
      startValue,
      endValue,
      duration
    ) {
      const self = this;

      self.startTime = currentTime;
      self.updateFunction = updateFunction;
      self.stopFunction = stopFunction;
      self.startValue = startValue;
      self.endValue = endValue;
      self.duration = duration;

      self.inProgress = true;
      self.count = 0;
    },

    step(currentTime) {
      const self = this;

      if (!self.inProgress) return;

      if (self.count > 0) self.count--;
      else {
        let elapsed = currentTime - self.startTime;

        if (elapsed > self.duration) elapsed = self.duration;

        const diff = self.endValue - self.startValue;
        const interval = Math.round(
          self.startValue + (diff / self.duration) * elapsed
        );

        if (elapsed === self.duration || interval === self.endValue) {
          self.stop();
          if (self.stopFunction) self.stopFunction();
        } else if (self.updateFunction) self.updateFunction(interval);
      }
    },

    restart(currentTime, startValue, endValue) {
      const self = this;

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

    stop() {
      this.inProgress = false;
    }
  });
});
