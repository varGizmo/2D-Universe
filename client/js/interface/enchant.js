define(["jquery"], function($) {
  return Class.extend({
    init(game, intrface) {
      const self = this;

      self.game = game;
      self.interface = intrface;

      self.body = $("#enchant");
      self.container = $("#enchantContainer");
      self.enchantSlots = $("#enchantInventorySlots");

      self.selectedItem = $("#enchantSelectedItem");
      self.selectedShards = $("#enchantShards");
      self.confirm = $("#confirmEnchant");
      self.shardsCount = $("#shardsCount");

      self.confirm.css({
        left: "70%",
        top: "80%"
      });

      $("#closeEnchant").click(function() {
        self.hide();
      });

      self.confirm.click(function() {
        self.enchant();
      });
    },

    resize() {
      const self = this;

      self.load();
    },

    load() {
      const self = this;
      const list = self.getSlots();
      const inventoryList = self.interface.bank.getInventoryList();

      list.empty();

      for (let i = 0; i < self.getInventorySize(); i++) {
        const item = $(inventoryList[i]).clone();
        const slot = item.find("#bankInventorySlot" + i);

        slot.click(function(event) {
          self.select(event);
        });

        list.append(item);
      }

      self.selectedItem.click(function() {
        self.remove("item");
      });

      self.selectedShards.click(function() {
        self.remove("shards");
      });
    },

    add(type, index) {
      const self = this;
      const image = self.getSlot(index).find("#inventoryImage" + index);

      switch (type) {
        case "item":
          self.selectedItem.css(
            "background-image",
            image.css("background-image")
          );

          if (self.game.app.isMobile())
          { self.selectedItem.css("background-size", "600%"); }

          break;

        case "shards":
          self.selectedShards.css(
            "background-image",
            image.css("background-image")
          );

          if (self.game.app.isMobile())
          { self.selectedShards.css("background-size", "600%"); }

          const count = self.getItemSlot(index).count;

          if (count > 1) self.shardsCount.text(count);

          break;
      }

      image.css("background-image", "");

      self
        .getSlot(index)
        .find("#inventoryItemCount" + index)
        .text("");
    },

    moveBack(type, index) {
      const self = this;
      const image = self.getSlot(index).find("#inventoryImage" + index);
      const itemCount = self.getSlot(index).find("#inventoryItemCount" + index);
      const count = self.getItemSlot(index).count;

      switch (type) {
        case "item":
          image.css(
            "background-image",
            self.selectedItem.css("background-image")
          );

          if (count > 1) itemCount.text(count);

          self.selectedItem.css("background-image", "");

          break;

        case "shards":
          image.css(
            "background-image",
            self.selectedShards.css("background-image")
          );

          if (count > 1) itemCount.text(count);

          self.selectedShards.css("background-image", "");

          self.shardsCount.text("");

          break;
      }
    },

    enchant() {
      this.game.socket.send(Packets.Enchant, [Packets.EnchantOpcode.Enchant]);
    },

    select(event) {
      this.game.socket.send(Packets.Enchant, [
        Packets.EnchantOpcode.Select,
        event.currentTarget.id.substring(17)
      ]);
    },

    remove(type) {
      this.game.socket.send(Packets.Enchant, [
        Packets.EnchantOpcode.Remove,
        type
      ]);
    },

    getInventorySize() {
      return this.interface.inventory.getSize();
    },

    getItemSlot(index) {
      return this.interface.inventory.container.slots[index];
    },

    display() {
      const self = this;

      self.body.fadeIn("fast");
      self.load();
    },

    hide() {
      const self = this;

      self.selectedItem.css("background-image", "");
      self.selectedShards.css("background-image", "");

      self.body.fadeOut("fast");
    },

    hasImage(image) {
      return image.css("background-image") !== "none";
    },

    getSlot(index) {
      return $(this.getSlots().find("li")[index]);
    },

    getSlots() {
      return this.enchantSlots.find("ul");
    },

    isVisible() {
      return this.body.css("display") === "block";
    }
  });
});
