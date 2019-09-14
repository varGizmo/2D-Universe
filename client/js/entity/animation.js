define(function() {
  return Class.extend({
    /**
     * Ripped from BrowserQuest's client
     */

    init(name, length, row, width, height) {
      const self = this;

      self.name = name;
      self.length = length;
      self.row = row;
      self.width = width;
      self.height = height;

      self.reset();
    },

    tick() {
      const self = this;
      let i = self.currentFrame.index;

      i = i < self.length - 1 ? i + 1 : 0;

      if (self.count > 0 && i === 0) {
        self.count -= 1;

        if (self.count === 0) {
          self.currentFrame.index = 0;
          self.endCountCallback();
          return;
        }
      }

      self.currentFrame.x = self.width * i;
      self.currentFrame.y = self.height * self.row;

      self.currentFrame.index = i;
    },

    update(time) {
      const self = this;

      if (self.lastTime === 0 && self.name.substr(0, 3) === "atk")
      { self.lastTime = time; }

      if (self.readyToAnimate(time)) {
        self.lastTime = time;
        self.tick();

        return true;
      } else return false;
    },

    setCount(count, onEndCount) {
      const self = this;

      self.count = count;
      self.endCountCallback = onEndCount;
    },

    setSpeed(speed) {
      this.speed = speed;
    },

    setRow(row) {
      this.row = row;
    },

    readyToAnimate(time) {
      return time - this.lastTime > this.speed;
    },

    reset() {
      const self = this;

      self.lastTime = 0;
      self.currentFrame = {
        index: 0,
        x: 0,
        y: self.row * self.height
      };
    }
  });
});
