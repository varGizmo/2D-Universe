import * as _ from "underscore";
//@ts-ignore
import BISON from "bison";
let useBison = false;
import * as http from "http";
import * as socket from "socket.io";
import * as url from "url";
import Utils from "./utils";

// Use 'connect' for its static module
import * as connect from "connect";
// Serve everything in the client subdirectory statically
import * as serveStatic from "serve-static";
// Display errors (such as 404's) in the server log
import * as logger from "morgan";

/**
 * Server and Connection classes
 */

class Server {
  port: any;
  connectionCallback: any;
  errorCallback: any;
  protected connections: any;
  constructor(port: any) {
    this.port = port;
  }

  onConnect(cb: any) {
    this.connectionCallback = cb;
  }

  onError(cb: any) {
    this.errorCallback = cb;
  }

  forEachConnection(cb: any) {
    _.each(this.connections, cb);
  }
  addConnection(connection: { id: string | number }) {
    this.connections[connection.id] = connection;
  }

  removeConnection(id: string | number) {
    delete this.connections[id];
  }

  getConnection(id: string | number) {
    return this.connections[id];
  }
}

class Connections {
  protected connection: any;
  protected server: any;
  id: any;
  closeCallback: any;
  listenCallback: any;
  constructor(id: any, connection: any, server: Server) {
    this.connection = connection;
    this.server = server;
    this.id = id;
  }

  onClose(cb: any) {
    this.closeCallback = cb;
  }

  listen(cb: any) {
    this.listenCallback = cb;
  }

  close(logError: string) {
    console.info(
      "Closing connection to " +
        this.connection.remoteAddress +
        ". Error: " +
        logError
    );
    this.connection.conn.close();
  }
  broadcast(message: any) {
    throw new Error("Method not implemented.");
  }
  send(message: any) {
    throw new Error("Method not implemented.");
  }
  sendUTF8(data: any) {
    throw new Error("Method not implemented.");
  }
}

/**
 * WebsocketServer
 */
class WebsocketServer extends Server {
  protected connections = {};
  private counter = 0;
  ip: any;
  private httpServer!: http.Server;
  private ioServer: any;
  statusCallback: any;

  constructor(
    port: string | number | undefined,
    useOnePort: boolean,
    ip?: any
  ) {
    super(port);

    this.ip = ip;

    // Are we doing both client and server on one port?
    if (useOnePort === true) {
      // Yes, we are; this is the default configuration option.

      // *GASP* o_O
      // -- Potato King

      let app = connect();

      //@ts-ignore
      app.use(serveStatic("client", { index: ["index.html"] }));

      //@ts-ignore
      app.use(logger("dev"));

      // Generate (on the fly) the pages needing special treatment
      app.use((request: any, response: any) => {
        let path = url.parse(request.url).pathname;
        switch (path) {
          case "/status":
            // The server status page
            if (this.statusCallback) {
              response.writeHead(200);
              response.write(this.statusCallback());
            }
            break;
          case "/config/config_build.json":
          case "/config/config_local.json":
            // Generate the config_build/local.json files on the
            // fly, using the host address and port from the
            // incoming http header

            // Grab the incoming host:port request string
            let headerPieces: any = request.connection.parser.incoming.headers.host.split(
              ":",
              2
            );

            // Determine new host string to give clients
            let newHost;
            if (
              typeof headerPieces[0] === "string" &&
              headerPieces[0].length > 0
            ) {
              // Seems like a valid string, lets use it
              newHost = headerPieces[0];
            } else {
              // The host value doesn't seem usable, so
              // fallback to the local interface IP address
              newHost = request.connection.address().address;
            }

            // Default port is 80
            let newPort = 80;
            if (2 === headerPieces.length) {
              // We've been given a 2nd value, maybe a port #
              if (
                typeof headerPieces[1] === "string" &&
                headerPieces[1].length > 0
              ) {
                // If a usable port value was given, use that instead
                let tmpPort = parseInt(headerPieces[1], 10);
                if (!isNaN(tmpPort) && tmpPort > 0 && tmpPort < 65536) {
                  newPort = tmpPort;
                }
              }
            }

            // Assemble the config data structure
            let newConfig = {
              host: newHost,
              port: newPort,
              dispatcher: false
            };

            // Make it JSON
            let newConfigString = JSON.stringify(newConfig);

            // Create appropriate http headers
            let responseHeaders = {
              "Content-Type": "application/json",
              "Content-Length": newConfigString.length
            };

            // Send it all back to the client
            response.writeHead(200, responseHeaders);
            response.end(newConfigString);
            break;
          case "/shared/js/file.js":
            // Sends the real shared/file.js to the client
            sendFile("js/file.js", response, console.log);
            break;
          case "/shared/js/gametypes.js":
            // Sends the real shared/gametypes.js to the client
            sendFile("js/gametypes.js", response, console.log);
            break;
          default:
            response.writeHead(404);
        }
        response.end();
      });

      this.httpServer = http
        .createServer(app)
        .listen(port, this.ip || undefined, () => {
          console.info(`Server (everything) is listening on port ${port}`);
        });
    } else {
      // Only run the server side code
      this.httpServer = http.createServer((request, response) => {
        //@ts-ignore
        let path = url.parse(request.url).pathname;
        if (path === "/status" && this.statusCallback) {
          response.writeHead(200);
          response.write(this.statusCallback());
        } else {
          response.writeHead(404);
        }
        response.end();
      });
      this.httpServer.listen(port, this.ip || undefined, () => {
        console.info(`Server (only) is listening on port ${port}`);
      });
    }

    this.ioServer = socket(this.httpServer);
    this.ioServer.on("connection", (socket: any) => {
      console.info(`Client socket connected from ${socket.conn.remoteAddress}`);
      // Add remoteAddress property
      socket.remoteAddress = socket.conn.remoteAddress;

      let c = new socketIOConnection(this.createId(), socket, this);

      if (this.connectionCallback) {
        this.connectionCallback(c);
      }

      this.addConnection(c);
    });
  }

  private createId() {
    return "5" + Utils.random(99) + "" + this.counter++;
  }

  broadcast(message: any) {
    this.forEachConnection((connection: any) => {
      connection.send(message);
    });
  }

  onRequestStatus(statusCallback: any) {
    this.statusCallback = statusCallback;
  }
}

/**
 * Connection class for socket.io Socket
 * https://github.com/Automattic/socket.io
 */
class socketIOConnection extends Connections {
  constructor(id: any, connection: any, server: Server) {
    super(id, connection, server);

    this.connection.on("message", (message: string) => {
      if (this.listenCallback) {
        if (useBison) {
          this.listenCallback(BISON.decode(message));
        } else {
          this.listenCallback(JSON.parse(message));
        }
      }
    });

    this.connection.on("disconnect", () => {
      console.info(
        "Client closed socket " + this.connection.conn.remoteAddress
      );
      if (this.closeCallback) {
        this.closeCallback();
      }
      //@ts-ignore
      delete this.server.removeConnection(this.id);
    });
  }

  send(message: any) {
    let data;
    if (useBison) {
      data = BISON.encode(message);
    } else {
      data = JSON.stringify(message);
    }
    this.sendUTF8(data);
  }

  sendUTF8(data: any) {
    this.connection.send(data);
  }
}

// Sends a file to the client
function sendFile(
  file: string,
  response: {
    writeHead: {
      (
        arg0: number,
        arg1: { "Content-Type": string; "Content-Length": any }
      ): void;
      (arg0: number): void;
    };
    end: (arg0: any) => void;
  },
  log: any
) {
  try {
    let fs = require("fs");
    let realFile = fs.readFileSync(__dirname + "/../../shared/" + file);
    let responseHeaders = {
      "Content-Type": "text/javascript",
      "Content-Length": realFile.length
    };
    response.writeHead(200, responseHeaders);
    response.end(realFile);
  } catch (err) {
    response.writeHead(500);
    console.error("Something went wrong when trying to send " + file);
    console.error("Error stack: " + err.stack);
  }
}

export default { WebsocketServer, socketIOConnection };
