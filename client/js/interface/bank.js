define(["jquery", "./container/container"], function($, Container) {
  return Class.extend({
    init(game, inventoryContainer, size) {
      const self = this;

      self.game = game;
      self.inventoryContainer = inventoryContainer;

      self.player = game.player;

      self.body = $("#bank");
      self.bankSlots = $("#bankSlots");
      self.bankInventorySlots = $("#bankInventorySlots");

      self.container = new Container(size);
      self.close = $("#closeBank");

      self.close.css("left", "97%");
      self.close.click(function() {
        self.hide();
      });
    },

    load(data) {
      const self = this;
      const bankList = self.bankSlots.find("ul");
      const inventoryList = self.bankInventorySlots.find("ul");

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const slot = $("<div id=\"bankSlot" + i + "\" class=\"bankSlot\"></div>");

        self.container.setSlot(i, item);

        slot.css({
          "margin-right": 2 * self.getScale() + "px",
          "margin-bottom": 4 * self.getScale() + "px"
        });

        const image = $("<div id=\"bankImage" + i + "\" class=\"bankImage\"></div>");

        if (item.string)
        { image.css(
          "background-image",
          self.container.getImageFormat(self.getDrawingScale(), item.string)
        ); }

        slot.click(function(event) {
          self.click("bank", event);
        });

        if (self.game.app.isMobile()) image.css("background-size", "600%");

        slot.append(image);
        slot.append(
          "<div id=\"bankItemCount" +
            i +
            "\" class=\"itemCount\">" +
            (item.count > 1 ? item.count : "") +
            "</div>"
        );

        slot.find("#bankItemCount" + i).css({
          "font-size": 4 * self.getScale() + "px",
          "margin-top": "0",
          "margin-left": "0"
        });

        const bankListItem = $("<li></li>");

        bankListItem.append(slot);

        bankList.append(bankListItem);
      }

      for (let j = 0; j < self.inventoryContainer.size; j++) {
        const iItem = self.inventoryContainer.slots[j];
        const iSlot = $(
          "<div id=\"bankInventorySlot" + j + "\" class=\"bankSlot\"></div>"
        );

        iSlot.css({
          "margin-right": 3 * self.getScale() + "px",
          "margin-bottom": 6 * self.getScale() + "px"
        });

        const slotImage = $(
          "<div id=\"inventoryImage" + j + "\" class=\"bankImage\"></div>"
        );

        if (iItem.string)
        { slotImage.css(
          "background-image",
          self.container.getImageFormat(self.getDrawingScale(), iItem.string)
        ); }

        iSlot.click(function(event) {
          self.click("inventory", event);
        });

        if (self.game.app.isMobile()) slotImage.css("background-size", "600%");

        iSlot.append(slotImage);
        iSlot.append(
          "<div id=\"inventoryItemCount" +
            j +
            "\" class=\"itemCount\">" +
            (iItem.count > 1 ? iItem.count : "") +
            "</div>"
        );

        iSlot.find("#inventoryItemCount" + j).css({
          "margin-top": "0",
          "margin-left": "0"
        });

        const inventoryListItem = $("<li></li>");

        inventoryListItem.append(iSlot);

        inventoryList.append(inventoryListItem);
      }
    },

    resize() {
      const self = this;
      const bankList = self.getBankList();
      const inventoryList = self.getInventoryList();

      for (let i = 0; i < bankList.length; i++) {
        const bankSlot = $(bankList[i]).find("#bankSlot" + i);
        const image = bankSlot.find("#bankImage" + i);
        const slot = self.container.slots[i];

        bankSlot.css({
          "margin-right": 2 * self.getScale() + "px",
          "margin-bottom": 4 * self.getScale() + "px"
        });

        bankSlot.find("#bankItemCount" + i).css({
          "font-size": 4 * self.getScale() + "px",
          "margin-top": "0",
          "margin-left": "0"
        });

        if (self.game.app.isMobile()) image.css("background-size", "600%");
        else
        { image.css(
          "background-image",
          self.container.getImageFormat(self.getDrawingScale(), slot.string)
        ); }
      }

      for (let j = 0; j < inventoryList.length; j++) {
        const inventorySlot = $(inventoryList[j]).find("#bankInventorySlot" + j);
        const iImage = inventorySlot.find("#inventoryImage" + j);
        const iSlot = self.inventoryContainer.slots[j];

        inventorySlot.css({
          "margin-right": 3 * self.getScale() + "px",
          "margin-bottom": 6 * self.getScale() + "px"
        });

        if (self.game.app.isMobile()) iImage.css("background-size", "600%");
        else
        { iImage.css(
          "background-image",
          self.container.getImageFormat(self.getDrawingScale(), iSlot.string)
        ); }
      }
    },

    click(type, event) {
      const self = this;
      const isBank = type === "bank";
      const index = event.currentTarget.id.substring(isBank ? 8 : 17);

      self.game.socket.send(Packets.Bank, [
        Packets.BankOpcode.Select,
        type,
        index
      ]);
    },

    add(info) {
      const self = this;
      const item = $(self.getBankList()[info.index]);
      const slot = self.container.slots[info.index];

      if (!item || !slot) return;

      if (slot.isEmpty())
      { slot.load(info.string, info.count, info.ability, info.abilityLevel); }

      slot.setCount(info.count);

      const bankSlot = item.find("#bankSlot" + info.index);
      const cssSlot = bankSlot.find("#bankImage" + info.index);
      const count = bankSlot.find("#bankItemCount" + info.index);

      cssSlot.css(
        "background-image",
        self.container.getImageFormat(self.getDrawingScale(), info.string)
      );

      if (self.game.app.isMobile()) cssSlot.css("background-size", "600%");

      if (slot.count > 1) count.text(slot.count);
    },

    remove(info) {
      const self = this;
      const item = $(self.getBankList()[info.index]);
      const slot = self.container.slots[info.index];

      if (!item || !slot) return;

      slot.count -= info.count;

      if (slot.count < 1) {
        const divItem = item.find("#bankSlot" + info.index);

        divItem.find("#bankImage" + info.index).css("background-image", "");
        divItem.find("#bankItemCount" + info.index).text("");

        slot.empty();
      }
    },

    addInventory(info) {
      const self = this;
      const item = $(self.getInventoryList()[info.index]);

      if (!item) return;

      const slot = item.find("#bankInventorySlot" + info.index);
      const image = slot.find("#inventoryImage" + info.index);

      image.css(
        "background-image",
        self.container.getImageFormat(self.getDrawingScale(), info.string)
      );

      if (self.game.app.isMobile()) image.css("background-size", "600%");

      if (info.count > 1)
      { slot.find("#inventoryItemCount" + info.index).text(info.count); }
    },

    removeInventory(info) {
      const self = this;
      const item = $(self.getInventoryList()[info.index]);

      if (!item) return;

      const slot = item.find("#bankInventorySlot" + info.index);

      slot.find("#inventoryImage" + info.index).css("background-image", "");
      slot.find("#inventoryItemCount" + info.index).text("");
    },

    display() {
      this.body.fadeIn("slow");
    },

    hide() {
      this.body.fadeOut("fast");
    },

    isVisible() {
      return this.body.css("display") === "block";
    },

    getDrawingScale() {
      return this.game.renderer.getDrawingScale();
    },

    getScale() {
      return this.game.getScaleFactor();
    },

    getBankList() {
      return this.bankSlots.find("ul").find("li");
    },

    getInventoryList() {
      return this.bankInventorySlots.find("ul").find("li");
    }
  });
});
