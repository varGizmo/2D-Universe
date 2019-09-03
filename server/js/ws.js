"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var _ = require("underscore");
var bison_1 = require("bison");
var useBison = false;
var http = require("http");
var socket = require("socket.io");
var url = require("url");
var utils_1 = require("./utils");
var connect = require("connect");
var serveStatic = require("serve-static");
var logger = require("morgan");
var Server = (function () {
    function Server(port) {
        this.port = port;
    }
    Server.prototype.onConnect = function (cb) {
        this.connectionCallback = cb;
    };
    Server.prototype.onError = function (cb) {
        this.errorCallback = cb;
    };
    Server.prototype.forEachConnection = function (cb) {
        _.each(this.connections, cb);
    };
    Server.prototype.addConnection = function (connection) {
        this.connections[connection.id] = connection;
    };
    Server.prototype.removeConnection = function (id) {
        delete this.connections[id];
    };
    Server.prototype.getConnection = function (id) {
        return this.connections[id];
    };
    return Server;
}());
var Connections = (function () {
    function Connections(id, connection, server) {
        this.connection = connection;
        this.server = server;
        this.id = id;
    }
    Connections.prototype.onClose = function (cb) {
        this.closeCallback = cb;
    };
    Connections.prototype.listen = function (cb) {
        this.listenCallback = cb;
    };
    Connections.prototype.close = function (logError) {
        console.info("Closing connection to " +
            this.connection.remoteAddress +
            ". Error: " +
            logError);
        this.connection.conn.close();
    };
    Connections.prototype.broadcast = function (message) {
        throw new Error("Method not implemented.");
    };
    Connections.prototype.send = function (message) {
        throw new Error("Method not implemented.");
    };
    Connections.prototype.sendUTF8 = function (data) {
        throw new Error("Method not implemented.");
    };
    return Connections;
}());
var WebsocketServer = (function (_super) {
    __extends(WebsocketServer, _super);
    function WebsocketServer(port, useOnePort, ip) {
        var _this = _super.call(this, port) || this;
        _this.connections = {};
        _this.counter = 0;
        _this.ip = ip;
        if (useOnePort === true) {
            var app = connect();
            app.use(serveStatic("client", { index: ["index.html"] }));
            app.use(logger("dev"));
            app.use(function (request, response) {
                var path = url.parse(request.url).pathname;
                switch (path) {
                    case "/status":
                        if (_this.statusCallback) {
                            response.writeHead(200);
                            response.write(_this.statusCallback());
                        }
                        break;
                    case "/config/config_build.json":
                    case "/config/config_local.json":
                        var headerPieces = request.connection.parser.incoming.headers.host.split(":", 2);
                        var newHost = void 0;
                        if (typeof headerPieces[0] === "string" &&
                            headerPieces[0].length > 0) {
                            newHost = headerPieces[0];
                        }
                        else {
                            newHost = request.connection.address().address;
                        }
                        var newPort = 80;
                        if (2 === headerPieces.length) {
                            if (typeof headerPieces[1] === "string" &&
                                headerPieces[1].length > 0) {
                                var tmpPort = parseInt(headerPieces[1], 10);
                                if (!isNaN(tmpPort) && tmpPort > 0 && tmpPort < 65536) {
                                    newPort = tmpPort;
                                }
                            }
                        }
                        var newConfig = {
                            host: newHost,
                            port: newPort,
                            dispatcher: false
                        };
                        var newConfigString = JSON.stringify(newConfig);
                        var responseHeaders = {
                            "Content-Type": "application/json",
                            "Content-Length": newConfigString.length
                        };
                        response.writeHead(200, responseHeaders);
                        response.end(newConfigString);
                        break;
                    case "/shared/js/file.js":
                        sendFile("js/file.js", response, console.log);
                        break;
                    case "/shared/js/gametypes.js":
                        sendFile("js/gametypes.js", response, console.log);
                        break;
                    default:
                        response.writeHead(404);
                }
                response.end();
            });
            _this.httpServer = http
                .createServer(app)
                .listen(port, _this.ip || undefined, function () {
                console.info("Server (everything) is listening on port " + port);
            });
        }
        else {
            _this.httpServer = http.createServer(function (request, response) {
                var path = url.parse(request.url).pathname;
                if (path === "/status" && _this.statusCallback) {
                    response.writeHead(200);
                    response.write(_this.statusCallback());
                }
                else {
                    response.writeHead(404);
                }
                response.end();
            });
            _this.httpServer.listen(port, _this.ip || undefined, function () {
                console.info("Server (only) is listening on port " + port);
            });
        }
        _this.ioServer = socket(_this.httpServer);
        _this.ioServer.on("connection", function (socket) {
            console.info("Client socket connected from " + socket.conn.remoteAddress);
            socket.remoteAddress = socket.conn.remoteAddress;
            var c = new socketIOConnection(_this.createId(), socket, _this);
            if (_this.connectionCallback) {
                _this.connectionCallback(c);
            }
            _this.addConnection(c);
        });
        return _this;
    }
    WebsocketServer.prototype.createId = function () {
        return "5" + utils_1["default"].random(99) + "" + this.counter++;
    };
    WebsocketServer.prototype.broadcast = function (message) {
        this.forEachConnection(function (connection) {
            connection.send(message);
        });
    };
    WebsocketServer.prototype.onRequestStatus = function (statusCallback) {
        this.statusCallback = statusCallback;
    };
    return WebsocketServer;
}(Server));
var socketIOConnection = (function (_super) {
    __extends(socketIOConnection, _super);
    function socketIOConnection(id, connection, server) {
        var _this = _super.call(this, id, connection, server) || this;
        _this.connection.on("message", function (message) {
            if (_this.listenCallback) {
                if (useBison) {
                    _this.listenCallback(bison_1["default"].decode(message));
                }
                else {
                    _this.listenCallback(JSON.parse(message));
                }
            }
        });
        _this.connection.on("disconnect", function () {
            console.info("Client closed socket " + _this.connection.conn.remoteAddress);
            if (_this.closeCallback) {
                _this.closeCallback();
            }
            delete _this.server.removeConnection(_this.id);
        });
        return _this;
    }
    socketIOConnection.prototype.send = function (message) {
        var data;
        if (useBison) {
            data = bison_1["default"].encode(message);
        }
        else {
            data = JSON.stringify(message);
        }
        this.sendUTF8(data);
    };
    socketIOConnection.prototype.sendUTF8 = function (data) {
        this.connection.send(data);
    };
    return socketIOConnection;
}(Connections));
function sendFile(file, response, log) {
    try {
        var fs = require("fs");
        var realFile = fs.readFileSync(__dirname + "/../../shared/" + file);
        var responseHeaders = {
            "Content-Type": "text/javascript",
            "Content-Length": realFile.length
        };
        response.writeHead(200, responseHeaders);
        response.end(realFile);
    }
    catch (err) {
        response.writeHead(500);
        console.error("Something went wrong when trying to send " + file);
        console.error("Error stack: " + err.stack);
    }
}
exports["default"] = { WebsocketServer: WebsocketServer, socketIOConnection: socketIOConnection };
