/* global Packets, Modules, log */

define(["jquery"], function($) {
  return Class.extend({
    init(game) {
      const self = this;

      self.game = game;

      self.chat = $("#chat");
      self.log = $("#chatLog");
      self.input = $("#chatInput");
      self.button = $("#chatButton");

      self.visible = false;

      self.fadingDuration = 5000;
      self.fadingTimeout = null;

      self.button.click(function() {
        self.button.blur();

        if (self.input.is(":visible")) self.hideInput();
        else self.toggle();
      });
    },

    add(source, text, colour) {
      const self = this;
      const element = $("<p>" + source + ": " + text + "</p>");

      self.showChat();

      if (!self.isActive()) self.hideInput();

      self.hideChat();

      element.css("color", colour || "white");

      self.log.append(element);
      self.log.scrollTop(99999);
    },

    key(data) {
      const self = this;

      switch (data) {
        case Modules.Keys.Enter:
          if (self.input.val() === "") self.toggle();
          else self.send();

          break;
      }
    },

    send() {
      const self = this;

      self.game.socket.send(Packets.Chat, [self.input.val()]);
      self.toggle();
    },

    toggle() {
      const self = this;

      self.clean();

      if (self.visible && !self.isActive()) self.showInput();
      else if (self.visible) {
        self.hideInput();
        self.hideChat();
      } else {
        self.showChat();
        self.showInput();
      }
    },

    showChat() {
      const self = this;

      self.chat.fadeIn("fast");

      self.visible = true;
    },

    showInput() {
      const self = this;

      self.button.addClass("active");

      self.input.fadeIn("fast");
      self.input.val("");
      self.input.focus();

      self.clean();
    },

    hideChat() {
      const self = this;

      if (self.fadingTimeout) {
        clearTimeout(self.fadingTimeout);
        self.fadingTimeout = null;
      }

      self.fadingTimeout = setTimeout(function() {
        if (!self.isActive()) {
          self.chat.fadeOut("slow");

          self.visible = false;
        }
      }, self.fadingDuration);
    },

    hideInput() {
      const self = this;

      self.button.removeClass("active");

      self.input.val("");
      self.input.fadeOut("fast");
      self.input.blur();

      self.hideChat();
    },

    clean() {
      const self = this;

      clearTimeout(self.fadingTimeout);
      self.fadingTimeout = null;
    },

    isActive() {
      return this.input.is(":focus");
    }
  });
});
