import * as _ from "underscore";
import Utils from "./utils";
import Mob from "./mob";

export default class Area {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  world: any;
  entities: any[];
  hasCompletelyRespawned: boolean;
  emptyCallback: any;
  nbEntities: any;
  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    world: any
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.world = world;
    this.entities = [];
    this.hasCompletelyRespawned = true;
  }

  protected getRandomPositionInsideArea() {
    var pos = { x: 0, y: 0 };
    var valid = false;

    while (!valid) {
      pos.x = this.x + Utils.random(this.width + 1);
      pos.y = this.y + Utils.random(this.height + 1);
      valid = this.world.isValidPosition(pos.x, pos.y);
    }
    return pos;
  }

  removeFromArea(entity: { id: any }) {
    var i = _.indexOf(_.pluck(this.entities, "id"), entity.id);
    this.entities.splice(i, 1);

    if (this.isEmpty() && this.hasCompletelyRespawned && this.emptyCallback) {
      this.hasCompletelyRespawned = false;
      this.emptyCallback();
    }
  }

  addToArea(entity: any) {
    if (entity) {
      this.entities.push(entity);
      entity.area = this;
      if (entity instanceof Mob) {
        this.world.addMob(entity);
      }
    }

    if (this.isFull()) {
      this.hasCompletelyRespawned = true;
    }
  }

  setNumberOfEntities(nb: any) {
    this.nbEntities = nb;
  }

  isEmpty() {
    return !_.any(this.entities, entity => {
      return !entity.isDead;
    });
  }

  isFull() {
    return !this.isEmpty() && this.nbEntities === _.size(this.entities);
  }

  onEmpty(cb: any) {
    this.emptyCallback = cb;
  }
}
