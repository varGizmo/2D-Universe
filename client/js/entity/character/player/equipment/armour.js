define(["./equipment"], function(Equipment) {
  return Equipment.extend({
    init(name, string, count, ability, abilityLevel) {
      const self = this;

      self._super(name, string, count, ability, abilityLevel);

      self.defence = -1;
    },

    setDefence(defence) {
      this.defence = defence;
    },

    getDefence() {
      return this.defence;
    },

    update(name, string, count, ability, abilityLevel) {
      this._super(name, string, count, ability, abilityLevel);
    }
  });
});
