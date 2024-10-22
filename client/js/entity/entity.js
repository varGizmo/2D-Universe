/* global Modules, log, _ */

define(["./entityhandler"], function(EntityHandler) {
  return Class.extend({
    init(id, kind) {
      const self = this;

      self.id = id;
      self.kind = kind;

      self.x = 0;
      self.y = 0;
      self.gridX = 0;
      self.gridY = 0;

      self.name = "";

      self.sprite = null;
      self.spriteFlipX = false;
      self.spriteFlipY = false;

      self.animations = null;
      self.currentAnimation = null;
      self.idleSpeed = 450;

      self.shadowOffsetY = 0;
      self.hidden = false;

      self.spriteLoaded = false;
      self.visible = true;
      self.fading = false;
      self.handler = new EntityHandler(self);

      self.angled = false;
      self.angle = 0;

      self.critical = false;
      self.stunned = false;
      self.terror = false;

      self.nonPathable = false;
      self.hasCounter = false;

      self.countdownTime = 0;
      self.counter = 0;

      self.renderingData = {
        scale: -1,
        angle: 0
      };

      self.loadDirty();
    },

    /**
     * This is important for when the client is
     * on a mobile screen. So the sprite has to be
     * handled differently.
     */

    loadDirty() {
      const self = this;

      self.dirty = true;

      if (self.dirtyCallback) self.dirtyCallback();
    },

    fadeIn(time) {
      const self = this;

      self.fading = true;
      self.fadingTime = time;
    },

    blink(speed) {
      const self = this;

      self.blinking = setInterval(function() {
        self.toggleVisibility();
      }, speed);
    },

    stopBlinking() {
      const self = this;

      if (self.blinking) clearInterval(self.blinking);

      self.setVisible(true);
    },

    setName(name) {
      this.name = name;
    },

    setSprite(sprite) {
      const self = this;

      if (!sprite || (self.sprite && self.sprite.name === sprite.name)) return;

      if (!sprite.loaded) sprite.load();

      sprite.name = sprite.id;

      self.sprite = sprite;

      self.normalSprite = self.sprite;
      self.hurtSprite = sprite.getHurtSprite();
      self.animations = sprite.createAnimations();
      self.spriteLoaded = true;

      if (self.readyCallback) self.readyCallback();
    },

    setPosition(x, y) {
      const self = this;

      self.x = x;
      self.y = y;
    },

    setGridPosition(x, y) {
      const self = this;

      self.gridX = x;
      self.gridY = y;

      self.setPosition(x * 16, y * 16);
    },

    setAnimation(name, speed, count, onEndCount) {
      const self = this;

      if (
        !self.spriteLoaded ||
        (self.currentAnimation && self.currentAnimation.name === name)
      )
      { return; }

      const anim = self.getAnimationByName(name);

      if (!anim) return;

      self.currentAnimation = anim;

      if (name.substr(0, 3) === "atk") self.currentAnimation.reset();

      self.currentAnimation.setSpeed(speed);

      self.currentAnimation.setCount(
        count || 0,
        onEndCount ||
          function() {
            self.idle();
          }
      );
    },

    setCountdown(count) {
      const self = this;

      self.counter = count;

      self.countdownTime = new Date().getTime();

      self.hasCounter = true;
    },

    setVisible(visible) {
      this.visible = visible;
    },

    setIdleSpeed(idleSpeed) {
      this.idleSpeed = idleSpeed;
    },

    hasWeapon() {
      return false;
    },

    getDistance(entity) {
      const self = this;
      const x = Math.abs(self.gridX - entity.gridX);
      const y = Math.abs(self.gridY - entity.gridY);

      return x > y ? x : y;
    },

    getCoordDistance(toX, toY) {
      const self = this;
      const x = Math.abs(self.gridX - toX);
      const y = Math.abs(self.gridY - toY);

      return x > y ? x : y;
    },

    inAttackRadius(entity) {
      return (
        entity &&
        this.getDistance(entity) < 2 &&
        !(this.gridX !== entity.gridX && this.gridY !== entity.gridY)
      );
    },

    inExtraAttackRadius(entity) {
      return (
        entity &&
        this.getDistance(entity) < 3 &&
        !(this.gridX !== entity.gridX && this.gridY !== entity.gridY)
      );
    },

    getAnimationByName(name) {
      if (name in this.animations) return this.animations[name];

      return null;
    },

    getSprite() {
      return this.sprite.name;
    },

    toggleVisibility() {
      this.setVisible(!this.visible);
    },

    isVisible() {
      return this.visible;
    },

    drawNames() {
      return true;
    },

    hasShadow() {
      return false;
    },

    hasPath() {
      return false;
    },

    onReady(callback) {
      this.readyCallback = callback;
    },

    onDirty(callback) {
      this.dirtyCallback = callback;
    }
  });
});
