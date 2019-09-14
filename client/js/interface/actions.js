/* global _, log */

define(["jquery"], function($) {
  return Class.extend({
    init(intrfce) {
      const self = this;

      self.interface = intrfce;

      self.body = $("#actionContainer");
      self.drop = $("#dropDialog");
      self.dropInput = $("#dropCount");

      self.pBody = $("#pActions");
      self.follow = $("#follow");
      self.trade = $("#tradeAction");

      self.activeClass = null;

      self.miscButton = null;

      self.load();
    },

    load() {
      const self = this;
      const dropAccept = $("#dropAccept");
      const dropCancel = $("#dropcancel");

      dropAccept.click(function(event) {
        if (self.activeClass === "inventory")
        { self.interface.inventory.clickAction(event); }
      });

      dropCancel.click(function(event) {
        if (self.activeClass === "inventory")
        { self.interface.inventory.clickAction(event); }
      });
    },

    loadDefaults(activeClass) {
      const self = this;

      self.activeClass = activeClass;

      switch (self.activeClass) {
        case "inventory":
          const dropButton = $("<div id=\"drop\" class=\"actionButton\">Drop</div>");

          self.add(dropButton);

          break;

        case "profile":
          break;
      }
    },

    add(button, misc) {
      const self = this;

      self.body.find("ul").prepend($("<li></li>").append(button));

      button.click(function(event) {
        if (self.activeClass === "inventory")
        { self.interface.inventory.clickAction(event); }
      });

      if (misc) self.miscButton = button;
    },

    removeMisc() {
      const self = this;

      self.miscButton.remove();
      self.miscButton = null;
    },

    reset() {
      const self = this;
      const buttons = self.getButtons();

      for (let i = 0; i < buttons.length; i++) $(buttons[i]).remove();
    },

    show() {
      this.body.fadeIn("fast");
    },

    showPlayerActions(player, mouseX, mouseY) {
      const self = this;

      if (!player) return;

      self.pBody.fadeIn("fast");
      self.pBody.css({
        left: mouseX - self.pBody.width() / 2 + "px",
        top: mouseY + self.pBody.height() / 2 + "px"
      });

      self.follow.click(function() {
        self.getPlayer().follow(player);

        self.hidePlayerActions();
      });

      self.trade.click(function() {
        self.getGame().tradeWith(player);

        self.hidePlayerActions();
      });
    },

    hide() {
      this.body.fadeOut("slow");
    },

    hidePlayerActions() {
      this.pBody.fadeOut("fast");
    },

    displayDrop(activeClass) {
      const self = this;

      self.activeClass = activeClass;

      self.drop.fadeIn("fast");

      self.dropInput.focus();
      self.dropInput.select();
    },

    hideDrop() {
      const self = this;

      self.drop.fadeOut("slow");

      self.dropInput.blur();
      self.dropInput.val("");
    },

    getButtons() {
      return this.body.find("ul").find("li");
    },

    getGame() {
      return this.interface.game;
    },

    getPlayer() {
      return this.interface.game.player;
    },

    isVisible() {
      return this.body.css("display") === "block";
    }
  });
});
