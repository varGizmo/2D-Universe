/* global log, Detect, Packets */

define(["jquery", "./container/container"], function($, Container) {
  return Class.extend({
    init: function(game, size) {
      let self = this;

      self.game = game;
      self.actions = game.interface.actions;

      self.body = $("#inventory");
      self.button = $("#inventoryButton");
      self.action = $("#actionContainer");

      self.container = new Container(size);

      self.activeClass = "inventory";

      self.selectedSlot = null;
      self.selectedItem = null;
    },

    load: function(data) {
      let self = this,
        list = $("#inventory").find("ul");

      for (let i = 0; i < data.length; i++) {
        let item = data[i];

        self.container.setSlot(i, item);

        let itemSlot = $('<div id="slot' + i + '" class="itemSlot"></div>');

        if (item.string !== "null")
          itemSlot.css(
            "background-image",
            self.container.getImageFormat(self.getScale(), item.string)
          );

        if (self.game.app.isMobile()) itemSlot.css("background-size", "600%");

        itemSlot.dblclick(function(event) {
          self.clickDouble(event);
        });

        itemSlot.click(function(event) {
          self.click(event);
        });

        let itemSlotList = $("<li></li>");

        itemSlotList.append(itemSlot);
        itemSlotList.append(
          '<div id="itemCount' +
            i +
            '" class="itemCount">' +
            (item.count > 1 ? item.count : "") +
            "</div>"
        );

        list.append(itemSlotList);
      }

      self.button.click(function(event) {
        self.game.interface.hideAll();

        if (self.isVisible()) self.hide();
        else self.display();
      });
    },

    click: function(event) {
      let self = this,
        index = event.currentTarget.id.substring(4),
        slot = self.container.slots[index],
        item = $(self.getList()[index]);

      self.clearSelection();

      if (slot.string === null || slot.count === -1 || slot.string === "null")
        return;

      self.actions.reset();
      self.actions.loadDefaults("inventory");

      if (slot.edible)
        self.actions.add($('<div id="eat" class="actionButton">Eat</div>'));
      else if (slot.equippable)
        self.actions.add($('<div id="wield" class="actionButton">Wield</div>'));

      if (!self.actions.isVisible()) self.actions.show();

      let sSlot = item.find("#slot" + index);

      sSlot.addClass("select");

      self.selectedSlot = sSlot;
      self.selectedItem = slot;

      self.actions.hideDrop();
    },

    clickDouble: function(event) {
      let self = this,
        index = event.currentTarget.id.substring(4),
        slot = self.container.slots[index];

      if (!slot.edible && !slot.equippable) return;

      let item = $(self.getList()[index]),
        sSlot = item.find("#slot" + index);

      self.clearSelection();

      self.selectedSlot = sSlot;
      self.selectedItem = slot;

      self.clickAction(slot.edible ? "eat" : "wield");

      self.actions.hideDrop();
    },

    clickAction: function(event, dAction) {
      let self = this,
        action = event.currentTarget ? event.currentTarget.id : event;

      if (!self.selectedSlot || !self.selectedItem) return;

      switch (action) {
        case "eat":
        case "wield":
          self.game.socket.send(Packets.Inventory, [
            Packets.InventoryOpcode.Select,
            self.selectedItem.index
          ]);
          self.clearSelection();

          break;

        case "drop":
          let item = self.selectedItem;

          if (item.count > 1) self.actions.displayDrop("inventory");
          else {
            self.game.socket.send(Packets.Inventory, [
              Packets.InventoryOpcode.Remove,
              item
            ]);
            self.clearSelection();
          }

          break;

        case "dropAccept":
          let count = $("#dropCount").val();

          if (isNaN(count) || count < 1) return;

          self.game.socket.send(Packets.Inventory, [
            Packets.InventoryOpcode.Remove,
            self.selectedItem,
            count
          ]);
          self.actions.hideDrop();
          self.clearSelection();

          break;

        case "dropCancel":
          self.actions.hideDrop();
          self.clearSelection();

          break;
      }

      self.actions.hide();
    },

    add: function(info) {
      let self = this,
        item = $(self.getList()[info.index]),
        slot = self.container.slots[info.index];

      if (!item || !slot) return;

      // Have the server forcefully load data into the slot.
      slot.load(
        info.string,
        info.count,
        info.ability,
        info.abilityLevel,
        info.edible,
        info.equippable
      );

      let cssSlot = item.find("#slot" + info.index);

      cssSlot.css(
        "background-image",
        self.container.getImageFormat(self.getScale(), slot.string)
      );

      if (self.game.app.isMobile()) cssSlot.css("background-size", "600%");

      item
        .find("#itemCount" + info.index)
        .text(slot.count > 1 ? slot.count : "");
    },

    remove: function(info) {
      let self = this,
        item = $(self.getList()[info.index]),
        slot = self.container.slots[info.index];

      if (!item || !slot) return;

      slot.count -= info.count;

      item.find("#itemCount" + info.index).text(slot.count);

      if (slot.count < 1) {
        item.find("#slot" + info.index).css("background-image", "");
        item.find("#itemCount" + info.index).text("");
        slot.empty();
      }
    },

    resize: function() {
      let self = this,
        list = self.getList();

      for (let i = 0; i < list.length; i++) {
        let item = $(list[i]).find("#slot" + i),
          slot = self.container.slots[i];

        if (!slot) continue;

        if (self.game.app.isMobile()) item.css("background-size", "600%");
        else
          item.css(
            "background-image",
            self.container.getImageFormat(self.getScale(), slot.string)
          );
      }
    },

    clearSelection: function() {
      let self = this;

      if (!self.selectedSlot) return;

      self.selectedSlot.removeClass("select");
      self.selectedSlot = null;
      self.selectedItem = null;
    },

    display: function() {
      let self = this;

      self.body.fadeIn("fast");
      self.button.addClass("active");
    },

    hide: function() {
      let self = this;

      self.button.removeClass("active");

      self.body.fadeOut("slow");
      self.button.removeClass("active");
      self.clearSelection();
    },

    getScale: function() {
      return this.game.renderer.getDrawingScale();
    },

    getSize: function() {
      return this.container.size;
    },

    getList: function() {
      return $("#inventory")
        .find("ul")
        .find("li");
    },

    isVisible: function() {
      return this.body.css("display") === "block";
    }
  });
});
