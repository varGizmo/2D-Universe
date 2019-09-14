define(["jquery", "./container/container"], function($, Container) {
  return Class.extend({
    init: function(game, intrface) {
      const self = this;

      self.game = game;

      self.body = $("#shop");
      self.shop = $("#shopContainer");
      self.inventory = $("#shopInventorySlots");

      self.player = game.player;
      self.interface = intrface;

      self.container = null;
      self.data = null;

      self.openShop = -1;

      self.items = [];
      self.counts = [];
    },

    buy: function(event) {
      const self = this;
      const id = event.currentTarget.id.substring(11);

      self.game.socket.send(Packets.Shop, [Packets.ShopOpcode.Buy, id, 1, 1]);
    },

    sell: function() {
      const self = this;
    },

    /**
     * The shop file is already built to support full de-initialization of objects when
     * we receive an update about the stocks. So we just use that whenever we want to resize.
     * This is just a temporary fix, in reality, we do not want anyone to actually see the shop
     * do a full refresh when they buy an item or someone else buys an item.
     */

    resize: function() {
      const self = this;

      self.getInventoryList().empty();
      self.getShopList().empty();

      self.update(self.data);
    },

    update: function(data) {
      const self = this;

      self.reset();

      self.container = new Container(data.strings.length);

      // Update the global data to current revision
      self.data = data;

      self.load();
    },

    load: function() {
      const self = this;

      for (let i = 0; i < self.container.size; i++) {
        const shopItem = $("<div id=\"shopItem" + i + "\" class=\"shopItem\"></div>");
        const string = self.data.strings[i];
        const name = self.data.names[i];
        const count = self.data.counts[i];
        let itemImage;
        let itemCount;
        let itemName;
        let itemBuy;

        if (!string || !name || !count) continue;

        itemImage = $(
          "<div id=\"shopItemImage" + i + "\" class=\"shopItemImage\"></div>"
        );
        itemCount = $(
          "<div id=\"shopItemCount" + i + "\" class=\"shopItemCount\"></div>"
        );
        itemName = $(
          "<div id=\"shopItemName" + i + "\" class=\"shopItemName\"></div>"
        );
        itemBuy = $(
          "<div id=\"shopItemBuy" + i + "\" class=\"shopItemBuy\"></div>"
        );

        itemImage.css(
          "background-image",
          self.container.getImageFormat(self.getScale(), string)
        );
        itemCount.html(count);
        itemName.html(name);
        itemBuy.html("Purchase");

        self.container.setSlot(i, {
          string: string,
          count: count
        });

        // Bind the itemBuy to the local buy function.
        itemBuy.click(function(event) {
          self.buy(event);
        });

        const listItem = $("<li></li>");

        shopItem.append(itemImage, itemCount, itemName, itemBuy);

        listItem.append(shopItem);

        self.getShopList().append(listItem);
      }

      const inventoryItems = self.interface.bank.getInventoryList();
      const inventorySize = self.interface.inventory.getSize();

      for (let j = 0; j < inventorySize; j++) {
        const item = $(inventoryItems[j]).clone();
        const slot = item.find("#bankInventorySlot" + j);

        self.getInventoryList().append(slot);
      }
    },

    reset: function() {
      const self = this;

      self.items = [];
      self.counts = [];

      self.container = null;

      self.getShopList().empty();
      self.getInventoryList().empty();
    },

    open: function(id) {
      const self = this;

      if (!id) return;

      self.openShop = id;

      self.body.fadeIn("slow");
    },

    hide: function() {
      const self = this;

      self.openShop = -1;

      self.body.fadeOut("fast");
    },

    getScale: function() {
      return this.game.renderer.getDrawingScale();
    },

    isVisible: function() {
      return this.body.css("display") === "block";
    },

    isShopOpen: function(shopId) {
      return this.isVisible() && this.openShop === shopId;
    },

    getShopList: function() {
      return this.shop.find("ul");
    },

    getInventoryList: function() {
      return this.inventory.find("ul");
    }
  });
});
