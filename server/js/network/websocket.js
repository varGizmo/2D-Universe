/* global module */

const Socket = require("./socket");
const Connection = require("./connection");
const connect = require("connect");
const serve = require("serve-static");
const request = require("request");
const SocketIO = require("socket.io");
const http = require("http");
const Utils = require("../util/utils");

class WebSocket extends Socket {
  constructor(host, port, version) {
    super(port);

    const self = this;

    self.host = host;
    self.version = version;

    self.ips = {};

    const app = connect();
    app.use(serve("client", { index: ["index.html"] }), null);

    self.httpServer = http
      .createServer(app)
      .listen(port, host, function serverEverythingListening() {
        log.info("Server is now listening on: " + port);

        if (self.webSocketReadyCallback) self.webSocketReadyCallback();
      });

    self.io = new SocketIO(self.httpServer);
    self.io.on("connection", function webSocketListener(socket) {
      log.info("Received connection from: " + socket.conn.remoteAddress);

      const client = new Connection(self.createId(), socket, self);

      socket.on("client", function(data) {
        if (data.gVer !== self.version) {
          client.sendUTF8("updated");
          client.close(
            "Wrong client version - expected " +
              self.version +
              " received " +
              data.gVer
          );
        }

        if (self.connectionCallback) self.connectionCallback(client);

        self.addConnection(client);
      });
    });
  }

  createId() {
    return "1" + Utils.random(9999) + "" + this._counter++;
  }

  onConnect(callback) {
    this.connectionCallback = callback;
  }

  onWebSocketReady(callback) {
    this.webSocketReadyCallback = callback;
  }
}

module.exports = WebSocket;
