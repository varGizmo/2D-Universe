/* global module */

const _ = require("underscore");
const ShopData = require("../util/shops");
const Items = require("../util/items");
const Messages = require("../network/messages");
const Packets = require("../network/packets");

class Shops {
  constructor(world) {
    const self = this;

    self.world = world;

    self.interval = 60000;
    self.shopInterval = null;

    self.load();
  }

  load() {
    const self = this;

    self.shopInterval = setInterval(function() {
      _.each(ShopData.Data, function(info) {
        for (let i = 0; i < info.count; i++) {
          if (info.count[i] < info.originalCount[i]) {
            ShopData.increment(info.id, info.items[i], 1);
          }
        }
      });
    }, self.interval);
  }

  open(player, shopId) {
    const self = this;

    player.send(
      new Messages.Shop(Packets.ShopOpcode.Open, {
        instance: player.instance,
        npcId: shopId,
        shopData: self.getShopData(shopId)
      })
    );
  }

  buy(player, shopId, itemId, count) {
    const self = this;
    const cost = ShopData.getCost(shopId, itemId, count);
    const currency = self.getCurrency(shopId);
    const stock = ShopData.getStock(shopId, itemId);

    // TODO: Make it so that when you have the exact coin count, it removes coins and replaces it with the item purchased.

    if (stock === 0) {
      player.notify("This item is currently out of stock.");
      return;
    }

    if (!player.inventory.contains(currency, cost)) {
      player.notify("You do not have enough money to purchase this.");
      return;
    }

    if (!player.inventory.hasSpace()) {
      player.notify("You do not have enough space in your inventory.");
      return;
    }

    if (count > stock) count = stock;

    player.inventory.remove(currency, cost);
    player.inventory.add(itemId, count);

    ShopData.decrement(shopId, itemId, count);

    self.refresh();
  }

  refresh(shopId) {
    const self = this;

    self.world.push(Packets.PushOpcode.Broadcast, {
      message: new Messages.Shop(
        Packets.ShopOpcode.Refresh,
        self.getShopData(shopId)
      )
    });
  }

  getCurrency(id) {
    return ShopData.Ids[id].currency;
  }

  getShopData(id) {
    const self = this;

    if (!ShopData.isShopNPC(id)) return;

    const items = ShopData.getItems(id);
    const strings = [];
    const names = [];

    for (let i = 0; i < items.length; i++) {
      strings.push(Items.idToString(items[i]));
      names.push(Items.idToName(items[i]));
    }

    return {
      id: id,
      strings: strings,
      names: names,
      counts: ShopData.getCount(id)
    };
  }
}

module.exports = Shops;
