/* global log, _ */

define(["./animation"], function(Animation) {
  return Class.extend({
    init(sprite, scale) {
      const self = this;

      self.sprite = sprite;
      self.scale = scale;

      self.id = sprite.id;

      self.loaded = false;

      self.offsetX = 0;
      self.offsetY = 0;
      self.offsetAngle = 0;

      self.whiteSprite = {
        loaded: false
      };

      self.loadSprite();
    },

    load() {
      const self = this;

      self.image = new Image();
      self.image.crossOrigin = "Anonymous";
      self.image.src = self.filepath;

      self.image.onload = function() {
        self.loaded = true;

        if (self.onLoadCallback) self.onLoadCallback();
      };
    },

    loadSprite() {
      const self = this;
      const sprite = self.sprite;

      self.filepath = "img/sprites/" + self.id + ".png";
      self.animationData = sprite.animations;

      self.width = sprite.width;
      self.height = sprite.height;

      self.offsetX = sprite.offsetX !== undefined ? sprite.offsetX : -16;
      self.offsetY = sprite.offsetY !== undefined ? sprite.offsetY : -16;
      self.offfsetAngle =
        sprite.offsetAngle !== undefined ? sprite.offsetAngle : 0;

      self.idleSpeed = sprite.idleSpeed !== undefined ? sprite.idleSpeed : 450;
    },

    update(newScale) {
      const self = this;

      self.scale = newScale;

      self.loadSprite();
      self.load();
    },

    createAnimations() {
      const self = this;
      const animations = {};

      for (const name in self.animationData) {
        if (self.animationData.hasOwnProperty(name)) {
          const a = self.animationData[name];

          animations[name] = new Animation(
            name,
            a.length,
            a.row,
            self.width,
            self.height
          );
        }
      }

      return animations;
    },

    /**
     * This is when an entity gets hit, they turn red then white.
     */

    createHurtSprite() {
      const self = this;

      if (!self.loaded) self.load();

      if (self.whiteSprite.loaded) return;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      let spriteData;
      let data;

      canvas.width = self.image.width;
      canvas.height = self.image.height;

      context.drawImage(self.image, 0, 0, self.image.width, self.image.height);

      try {
        spriteData = context.getImageData(
          0,
          0,
          self.image.width,
          self.image.height
        );
        data = spriteData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255;
          data[i + 1] = data[i + 2] = 75;
        }

        spriteData.data = data;

        context.putImageData(spriteData, 0, 0);

        self.whiteSprite = {
          image: canvas,
          loaded: true,
          offsetX: self.offsetX,
          offsetY: self.offsetY,
          width: self.width,
          height: self.height
        };
      } catch (e) {}
    },

    getHurtSprite() {
      const self = this;

      try {
        if (!self.loaded) self.load();

        self.createHurtSprite();

        return self.whiteSprite;
      } catch (e) {}
    },

    onLoad(callback) {
      this.onLoadCallback = callback;
    }
  });
});
