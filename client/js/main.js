/* global log, Detect */

define(["jquery", "./app", "./game"], function($, App, Game) {
  let app, body, chatInput, game;

  const load = function() {
    $(document).ready(function() {
      app = new App();
      body = $("body");
      chatInput = $("#chatInput");

      addClasses();
      initGame();
      addListeners();
    });

    $("#fullscreen-icon").click(() => {
      const elem = document.documentElement;

      if (document.fullscreen) {
        /* Close fullscreen */
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          /* Firefox */
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          /* IE/Edge */
          document.msExitFullscreen();
        }
      } else {
        /* View in fullscreen */
        if (this.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          /* Firefox */
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          /* IE/Edge */
          elem.msRequestFullscreen();
        }
      }
    });
  };

  const addClasses = function() {
    const self = this;

    if (Detect.isWindows()) body.addClass("windows");

    if (Detect.isOpera()) body.addClass("opera");

    if (Detect.isFirefoxAndroid()) chatInput.removeAttr("placeholder");
  };

  const addListeners = function() {
    const self = this;
    const resizeCheck = $("#resizeCheck");

    document.addEventListener("touchstart", function() {}, false);
    document.addEventListener("touchmove", function(e) {
      e.preventDefault();
    });

    resizeCheck.bind("transitionend", app.resize.bind(app));
    resizeCheck.bind("webkitTransitionEnd", app.resize.bind(app));
    resizeCheck.bind("oTransitionEnd", app.resize.bind(app));

    $(window).on("orientationchange", function(event) {
      app.updateOrientation();
    });
  };

  const initGame = function() {
    app.onReady(function() {
      app.sendStatus("Loading game");

      game = new Game(app);
      app.setGame(game);
    });
  };

  load();
});
