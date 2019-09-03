import Entity from "./entity";
import Messages from "./message";
import Utils from "./utils";

export default class Character extends Entity {
  orientation: any;
  attackers: { [key: string]: any };
  target: null;
  maxHitPoints: any;
  hitPoints: any;
  id: any;
  constructor(id: any, type: any, kind: any, x: any, y: any) {
    super(id, type, kind, x, y);

    this.orientation = Utils.randomOrientation();
    this.attackers = {};
    this.target = null;
  }

  getState() {
    let basestate = this.getBaseState(),
      state = [];

    state.push(this.orientation);
    if (this.target) {
      state.push(this.target);
    }

    return basestate.concat(state);
  }

  resetHitPoints(maxHitPoints: any) {
    this.maxHitPoints = maxHitPoints;
    this.hitPoints = this.maxHitPoints;
  }

  regenHealthBy(value: number) {
    let hp = this.hitPoints,
      max = this.maxHitPoints;

    if (hp < max) {
      if (hp + value <= max) {
        this.hitPoints += value;
      } else {
        this.hitPoints = max;
      }
    }
  }

  hasFullHealth() {
    return this.hitPoints === this.maxHitPoints;
  }

  setTarget(entity: { id: null }) {
    this.target = entity.id;
  }

  clearTarget() {
    this.target = null;
  }

  hasTarget() {
    return this.target !== null;
  }

  attack() {
    return new Messages.Attack(this.id, this.target);
  }

  health() {
    return new Messages.Health(this.hitPoints, false);
  }

  regen() {
    return new Messages.Health(this.hitPoints, true);
  }

  addAttacker(entity: { id: string }) {
    if (entity) {
      this.attackers[entity.id] = entity;
    }
  }

  removeAttacker(entity: { id: string }) {
    if (entity && entity.id in this.attackers) {
      delete this.attackers[entity.id];
      console.debug(`${this.id} REMOVED ATTACKER ${entity.id}`);
    }
  }

  forEachAttacker(cb: (arg0: any) => void) {
    for (let id in this.attackers) {
      cb(this.attackers[id]);
    }
  }
}
