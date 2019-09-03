import Item from "./item";
import Utils from "./utils";
import * as _ from "underscore";
import Types from "../../shared/js/gametypes";

export default class Chest extends Item {
  items: Item[] = [];
  constructor(id: string, x: number, y: number) {
    super(id, Types.Entities.CHEST, x, y);
  }

  setItems(items: any) {
    this.items = items;
  }

  getRandomItem() {
    var nbItems = _.size(this.items);

    if (nbItems > 0) {
      return this.items[Utils.random(nbItems)];
    } else return null;
  }
}
