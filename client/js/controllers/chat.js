/* global Packets, Modules, log */

define(["jquery"], function($) {
  return Class.extend({
    init: function(game) {
      let self = this;

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

    add: function(source, text, colour) {
      let self = this,
        element = $("<p>" + source + ": " + text + "</p>");

      self.showChat();

      if (!self.isActive()) self.hideInput();

      self.hideChat();

      element.css("color", colour ? colour : "white");

      self.log.append(element);
      self.log.scrollTop(99999);
    },

    key: function(data) {
      let self = this;

      switch (data) {
        case Modules.Keys.Enter:
          if (self.input.val() === "") self.toggle();
          else self.send();

          break;
      }
    },

    send: function() {
      let self = this;

      self.game.socket.send(Packets.Chat, [self.input.val()]);
      self.toggle();
    },

    toggle: function() {
      let self = this;

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

    showChat: function() {
      let self = this;

      self.chat.fadeIn("fast");

      self.visible = true;
    },

    showInput: function() {
      let self = this;

      self.button.addClass("active");

      self.input.fadeIn("fast");
      self.input.val("");
      self.input.focus();

      self.clean();
    },

    hideChat: function() {
      let self = this;

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

    hideInput: function() {
      let self = this;

      self.button.removeClass("active");

      self.input.val("");
      self.input.fadeOut("fast");
      self.input.blur();

      self.hideChat();
    },

    clean: function() {
      let self = this;

      clearTimeout(self.fadingTimeout);
      self.fadingTimeout = null;
    },

    isActive: function() {
      return this.input.is(":focus");
    }
  });
});
