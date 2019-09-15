/* global log, Class, Detect, Modules */

define(["jquery"], function($) {
  return Class.extend({
    init() {
      const self = this;

      log.info("Loading the main application...");

      self.config = null;

      self.body = $("body");
      self.parchment = $("#parchment");
      self.container = $("#container");
      self.window = $(window);
      self.canvas = $("#canvas");
      self.border = $("#border");

      self.intro = $("#intro");

      self.loginButton = $("#login");
      self.createButton = $("#play");
      self.registerButton = $("#newCharacter");
      self.helpButton = $("#helpButton");
      self.cancelButton = $("#cancelButton");
      self.yes = $("#yes");
      self.no = $("#no");
      self.loading = $(".loader");

      self.respawn = $("#respawn");

      self.rememberMe = $("#rememberMe");
      self.guest = $("#guest");

      self.about = $("#toggle-about");
      self.credits = $("#toggle-credits");
      self.git = $("#toggle-git");

      self.loginFields = [];
      self.registerFields = [];

      self.game = null;
      self.zoomFactor = 1;

      self.parchmentAnimating = false;
      self.loggingIn = false;

      self.sendStatus("Initializing the main app");

      self.zoom();
      self.updateOrientation();
      self.load();
    },

    load() {
      const self = this;

      self.loginButton.click(function() {
        self.login();
      });

      self.createButton.click(function() {
        self.login();
      });

      self.registerButton.click(function() {
        self.openScroll("loadCharacter", "createCharacter");
      });

      self.cancelButton.click(function() {
        self.openScroll("createCharacter", "loadCharacter");
      });

      self.parchment.click(function() {
        if (
          self.parchment.hasClass("about") ||
          self.parchment.hasClass("credits") ||
          self.parchment.hasClass("git")
        ) {
          self.parchment.removeClass("about credits git");
          self.displayScroll("loadCharacter");
        }
      });

      self.about.click(function() {
        self.displayScroll("about");
      });

      self.credits.click(function() {
        self.displayScroll("credits");
      });

      self.git.click(function() {
        self.displayScroll("git");
      });

      self.rememberMe.click(function() {
        if (!self.game || !self.game.storage) return;

        const active = self.rememberMe.hasClass("active");

        self.rememberMe.toggleClass("active");

        self.game.storage.toggleRemember(!active);
      });

      self.guest.click(function() {
        if (!self.game) return;

        self.guest.toggleClass("active");
      });

      self.respawn.click(function() {
        if (!self.game || !self.game.player || !self.game.player.dead) return;

        self.game.respawn();
      });

      window.scrollTo(0, 1);

      self.window.resize(function() {
        self.zoom();
      });

      $.getJSON("data/config.json", function(json) {
        self.config = json;

        if (self.readyCallback) self.readyCallback();
      });

      $(document).bind("keydown", function(e) {
        if (e.which === Modules.Keys.Enter) return false;
      });

      $(document).keydown(function(e) {
        const key = e.which;

        if (!self.game) return;

        self.body.focus();

        if (key === Modules.Keys.Enter && !self.game.started) {
          self.login();
          return;
        }

        if (self.game.started) self.game.onInput(Modules.InputType.Key, key);
      });

      $(document).keyup(function(e) {
        const key = e.which;

        if (!self.game || !self.game.started) return;

        self.game.input.keyUp(key);
      });

      $(document).mousemove(function(event) {
        if (
          !self.game ||
          !self.game.input ||
          !self.game.started ||
          event.target.id !== "textCanvas"
        ) {
          return;
        }

        self.game.input.setCoords(event);
        self.game.input.moveCursor();
      });

      // self.canvas.click(function(event) {
      //   if (!self.game || !self.game.started || event.button !== 0) return;

      //   window.scrollTo(0, 1);

      //   self.game.input.handle(Modules.InputType.LeftClick, event);
      // });

      $("input[type=\"range\"]").on("input", function() {
        self.updateRange($(this));
      });
    },

    login() {
      const self = this;

      if (
        self.loggingIn ||
        !self.game ||
        !self.game.loaded ||
        self.statusMessage ||
        !self.verifyForm()
      ) {
        return;
      }

      self.toggleLogin(true);
      self.game.connect();
    },

    zoom() {
      const self = this;

      const containerWidth = self.container.width();
      const containerHeight = self.container.height();
      const windowWidth = self.window.width();
      const windowHeight = self.window.height();
      let zoomFactor = windowWidth / containerWidth;

      if (containerHeight + 50 >= windowHeight) {
        zoomFactor = windowHeight / containerHeight;
      }

      if (self.getScaleFactor() === 3) zoomFactor -= 0.1;

      if (self.getScaleFactor() === 1 && windowWidth > windowHeight) {
        zoomFactor -= 0.32;
      }

      self.body.css({
        zoom: zoomFactor,
        "-moz-transform": "scale(" + zoomFactor + ")"
      });

      self.border.css("top", 0);

      self.zoomFactor = zoomFactor;
    },

    fadeMenu() {
      const self = this;

      self.updateLoader(null);

      setTimeout(function() {
        self.body.addClass("game");
        self.body.addClass("started");
        self.body.removeClass("intro");
      }, 500);
    },

    showMenu() {
      const self = this;

      self.body.removeClass("game");
      self.body.removeClass("started");
      self.body.addClass("intro");
    },

    showDeath() {},

    openScroll(origin, destination) {
      const self = this;

      if (!destination || self.loggingIn) return;

      self.cleanErrors();

      if (!self.isMobile()) {
        if (self.parchmentAnimating) return;

        self.parchmentAnimating = true;

        self.parchment.toggleClass("animate").removeClass(origin);

        setTimeout(
          function() {
            self.parchment.toggleClass("animate").addClass(destination);
            self.parchmentAnimating = false;
          },
          self.isTablet() ? 0 : 1000
        );
      } else self.parchment.removeClass(origin).addClass(destination);
    },

    displayScroll(content) {
      const self = this;
      const state = self.parchment.attr("class");

      if (self.game.started) {
        self.parchment.removeClass().addClass(content);

        self.body.removeClass("credits legal about").toggleClass(content);

        if (self.game.player) self.body.toggleClass("death");

        if (content !== "about") self.helpButton.removeClass("active");
      } else if (state !== "animate") {
        self.openScroll(state, state === content ? "loadCharacter" : content);
      }
    },

    verifyForm() {
      const self = this;
      const activeForm = self.getActiveForm();

      if (activeForm === "null") return;

      switch (activeForm) {
        case "loadCharacter":
          const nameInput = $("#loginNameInput");
          const passwordInput = $("#loginPasswordInput");

          if (self.loginFields.length === 0) {
            self.loginFields = [nameInput, passwordInput];
          }

          if (!nameInput.val() && !self.isGuest()) {
            self.sendError(nameInput, "Please enter a username.");
            return false;
          }

          if (!passwordInput.val() && !self.isGuest()) {
            self.sendError(passwordInput, "Please enter a password.");
            return false;
          }

          break;

        case "createCharacter":
          const characterName = $("#registerNameInput");
          const registerPassword = $("#registerPasswordInput");
          const registerPasswordConfirmation = $(
            "#registerPasswordConfirmationInput"
          );
          const email = $("#registerEmailInput");

          if (self.registerFields.length === 0) {
            self.registerFields = [
              characterName,
              registerPassword,
              registerPasswordConfirmation,
              email
            ];
          }

          if (!characterName.val()) {
            self.sendError(characterName, "A username is necessary you silly.");
            return false;
          }

          if (!registerPassword.val()) {
            self.sendError(registerPassword, "You must enter a password.");
            return false;
          }

          if (registerPasswordConfirmation.val() !== registerPassword.val()) {
            self.sendError(
              registerPasswordConfirmation,
              "The passwords do not match!"
            );
            return false;
          }

          if (!email.val() || !self.verifyEmail(email.val())) {
            self.sendError(email, "An email is required!");
            return false;
          }

          break;
      }

      return true;
    },

    verifyEmail(email) {
      return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      );
    },

    sendStatus(message) {
      const self = this;

      self.cleanErrors();

      self.statusMessage = message;

      if (!message) return;

      $("<span></span>", {
        class: "status blink",
        text: message
      }).appendTo(".validation-summary");

      $(".status").append(
        "<span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span>"
      );
    },

    sendError(field, error) {
      this.cleanErrors();

      $("<span></span>", {
        class: "validation-error blink",
        text: error
      }).appendTo(".validation-summary");

      if (!field) return;

      field.addClass("field-error").select();
      field.bind("keypress", function(event) {
        field.removeClass("field-error");

        $(".validation-error").remove();

        $(this).unbind(event);
      });
    },

    cleanErrors() {
      const self = this;
      const activeForm = self.getActiveForm();
      const fields =
        activeForm === "loadCharacter" ? self.loginFields : self.registerFields;

      for (let i = 0; i < fields.length; i++) {
        fields[i].removeClass("field-error");
      }

      $(".validation-error").remove();
      $(".status").remove();
    },

    getActiveForm() {
      return this.parchment[0].className;
    },

    isRegistering() {
      return this.getActiveForm() === "createCharacter";
    },

    isGuest() {
      return this.guest.hasClass("active");
    },

    resize() {
      const self = this;

      if (self.game) self.game.resize();
    },

    setGame(game) {
      this.game = game;
    },

    hasWorker() {
      return !!window.Worker;
    },

    getScaleFactor() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      /**
       * These are raw scales, we can adjust
       * for up-scaled rendering in the actual
       * rendering file.
       */

      return width <= 1000 ? 1 : width <= 1500 || height <= 870 ? 2 : 3;
    },

    revertLoader() {
      this.updateLoader("Connecting");
    },

    updateLoader(message) {
      const self = this;

      if (!message) {
        self.loading.html("");
        return;
      }

      const dots =
        "<span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span>";
      self.loading.html(message + dots);
    },

    toggleLogin(toggle) {
      const self = this;

      self.revertLoader();

      self.toggleTyping(toggle);

      self.loggingIn = toggle;

      if (toggle) {
        self.loading.removeAttr("hidden");

        self.loginButton.addClass("disabled");
        self.registerButton.addClass("disabled");
      } else {
        self.loading.attr("hidden", true);

        self.loginButton.removeClass("disabled");
        self.registerButton.removeClass("disabled");
      }
    },

    toggleTyping(state) {
      const self = this;

      if (self.loginFields) {
        _.each(self.loginFields, function(field) {
          field.prop("readonly", state);
        });
      }

      if (self.registerFields) {
        _.each(self.registerFields, function(field) {
          field.prop("readOnly", state);
        });
      }
    },

    updateRange(obj) {
      const self = this;
      const val =
        (obj.val() - obj.attr("min")) / (obj.attr("max") - obj.attr("min"));

      obj.css(
        "background-image",
        "-webkit-gradient(linear, left top, right top, " +
          "color-stop(" +
          val +
          ", #4d4d4d), " +
          "color-stop(" +
          val +
          ", #C5C5C5)" +
          ")"
      );
    },

    updateOrientation() {
      this.orientation = this.getOrientation();
    },

    getOrientation() {
      return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    },

    getZoom() {
      return this.zoomFactor;
    },

    onReady(callback) {
      this.readyCallback = callback;
    },

    isMobile() {
      return this.getScaleFactor() < 2;
    },

    isTablet() {
      return (
        Detect.isIpad() || (Detect.isAndroid() && this.getScaleFactor() > 1)
      );
    }
  });
});
