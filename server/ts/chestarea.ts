import Area from "./area";
import Item from "./item";
import Entity from "./entity";

export default class ChestArea extends Area {
  items: Item[];
  chestX: any;
  chestY: any;
  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    cx: number,
    cy: number,
    items: Item[],
    world: any
  ) {
    super(id, x, y, width, height, world);
    this.items = items;
    this.chestX = cx;
    this.chestY = cy;
  }

  contains(entity: Entity) {
    if (entity) {
      return (
        entity.x >= this.x &&
        entity.y >= this.y &&
        entity.x < this.x + this.width &&
        entity.y < this.y + this.height
      );
    } else {
      return false;
    }
  }
}
