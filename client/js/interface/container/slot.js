define(function() {
  return Class.extend({
    init: function(index) {
      let self = this;

      self.index = index;

      self.string = null;
      self.count = -1;
      self.ability = -1;
      self.abilityLevel = -1;

      self.edible = false;
      self.equippable = false;
    },

    load: function(string, count, ability, abilityLevel, edible, equippable) {
      let self = this;

      self.string = string;
      self.count = count;
      self.ability = ability;
      self.abilityLevel = abilityLevel;

      self.edible = edible;
      self.equippable = equippable;
    },

    empty: function() {
      let self = this;

      self.string = null;
      self.count = -1;
      self.ability = -1;
      self.abilityLevel = -1;

      self.edible = false;
      self.equippable = false;
    },

    isEmpty: function() {
      return !this.string || this.count < 1;
    },

    setCount: function(count) {
      this.count = count;
    },

    setString: function(string) {
      this.string = string;
    }
  });
});
