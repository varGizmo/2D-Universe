const cls = require("../../server/js/lib/class");
const redis = require("redis");
const request = require("request");

function load() {
  const registrar = new Registrar();

  registrar.onReady(function() {});
}

module.exports = Registrar = cls.Class.extend({
  init: function() {
    const self = this;

    self.client = redis.createClient("127.0.0.1", 6379, {
      socket_nodelay: true
    });

    self.readyCallback();
  },

  onReady: function(callback) {
    this.readyCallback = callback;
  }
});

load();
