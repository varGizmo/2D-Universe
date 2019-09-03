import Messages from "./message";
import Utils from "./utils";

export default class Entity {
  id: any;
  type: any;
  kind: any;
  x!: number;
  y!: number;
  group: any;
  constructor(id: string, type: any, kind: any, x: number, y: number) {
    this.id = parseInt(id, 10);
    this.type = type;
    this.kind = kind;
    this.x = x;
    this.y = y;
  }

  destroy() {}

  protected getBaseState() {
    return [parseInt(this.id, 10), this.kind, this.x, this.y];
  }

  getState() {
    return this.getBaseState();
  }

  spawn() {
    return new Messages.Spawn(this);
  }

  despawn() {
    return new Messages.Despawn(this.id);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getPositionNextTo(entity: Entity) {
    let pos = { x: 0, y: 0 };
    if (entity) {
      pos = { x: 0, y: 0 };
      // This is a quick & dirty way to give mobs a random position
      // close to another entity.
      let r = Utils.random(4);

      pos.x = entity.x;
      pos.y = entity.y;
      if (r === 0) {
        pos.y -= 1;
      }
      if (r === 1) {
        pos.y += 1;
      }
      if (r === 2) {
        pos.x -= 1;
      }
      if (r === 3) {
        pos.x += 1;
      }
    }
    return pos;
  }
}
