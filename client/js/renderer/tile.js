define(function() {
  return Class.extend({
    init: function(id, index, map) {
      const self = this;

      self.id = id;
      self.index = index;
      self.map = map;

      self.animationInfo = map.getTileAnimation(id);

      self.animationIndex = 0;
      self.lastTime = 0;

      self.loaded = false;
    },

    setPosition: function(position) {
      this.x = position.x;
      this.y = position.y;
    },

    update: function() {
      this.id = this.animationInfo[this.animationIndex].tileID - 1;
    },

    animate: function(time) {
      const self = this;

      if (
        time - self.lastTime >
        self.animationInfo[self.animationIndex].duration
      ) {
        self.update();
        self.lastTime = time;

        if (self.animationIndex >= self.animationInfo.length - 1)
        { self.animationIndex = 0; }
        else self.animationIndex++;
      }
    },

    getPosition: function() {
      return this.x && this.y ? [this.x, this.y] : [0, 0];
    }
  });
});