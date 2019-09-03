import Utils from "./utils";

export default {
  dmg(weaponLevel: any, armorLevel: any) {
    let dealt = weaponLevel * Utils.randomInt(5, 10);
    let absorbed = armorLevel * Utils.randomInt(1, 3);
    let dmg = dealt - absorbed;

    console.log(`abs: ${absorbed} dealt: ${dealt} dmg: ${dealt - absorbed}`);

    if (dmg <= 0) {
      return Utils.randomInt(0, 3);
    } else {
      return dmg;
    }
  },
  hp(armorLevel: any) {
    var hp = 80 + (armorLevel - 1) * 30;
    return hp;
  }
};
