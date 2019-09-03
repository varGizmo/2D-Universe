import * as _ from "underscore";
import Area from "./area";
import Mob from "./mob";
import Types from "../../shared/js/gametypes";
import Utils from "./utils";

export default class MobArea extends Area {
  nb: any;
  kind: any;
  respawns: any[];
  isDead!: boolean;
  constructor(
    id: string,
    nb: any,
    kind: any,
    x: number,
    y: number,
    width: number,
    height: number,
    world: any
  ) {
    super(id, x, y, width, height, world);
    this.nb = nb;
    this.kind = kind;
    this.respawns = [];
    this.setNumberOfEntities(this.nb);

    // Enable random roaming for monsters
    // (comment this out to disable roaming)
    this.initRoaming();
  }

  spawnMobs() {
    for (var i = 0; i < this.nb; i += 1) {
      this.addToArea(this.createMobInsideArea());
    }
  }

  private createMobInsideArea() {
    var k = Types.getKindFromString(this.kind);
    var pos = this.getRandomPositionInsideArea();
    var mob = new Mob(
      "1" + this.id + "" + k + "" + this.entities.length,
      k,
      pos.x,
      pos.y
    );

    mob.onMove(this.world.onMobMoveCallback.bind(this.world));

    return mob;
  }

  respawnMob(mob: Mob, delay: number) {
    this.removeFromArea(mob);

    setTimeout(() => {
      var pos = this.getRandomPositionInsideArea();

      mob.x = pos.x;
      mob.y = pos.y;
      mob.isDead = false;
      this.addToArea(mob);
      this.world.addMob(mob);
    }, delay);
  }

  initRoaming(mob?: Mob) {
    setInterval(() => {
      _.each(this.entities, mob => {
        var canRoam = Utils.random(20) === 1;
        var pos;

        if (canRoam) {
          if (!mob.hasTarget() && !mob.isDead) {
            pos = this.getRandomPositionInsideArea();
            mob.move(pos.x, pos.y);
          }
        }
      });
    }, 500);
  }

  createReward() {
    var pos = this.getRandomPositionInsideArea();

    return { x: pos.x, y: pos.y, kind: Types.Entities.CHEST };
  }
}
