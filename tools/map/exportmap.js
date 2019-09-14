#!/usr/bin/env node

const Log = require("log");
const fs = require("fs");
const file = require("../file");
const processMap = require("./processmap");
const log = new Log(Log.DEBUG);
let source = process.argv[2];

function getMap() {
  if (!source) {
    source = "data/world.json";
  }

  file.exists(source, function(exists) {
    if (!exists) {
      log.error("The file: " + source + " could not be found.");
      return;
    }

    fs.readFile(source, function(error, file) {
      log.error(error);
      onMap(JSON.parse(file.toString()));
    });
  });
}

function onMap(data) {
  parseClient(data, "../../server/data/map/world_client");
  parseServer(data, "../../server/data/map/world_server");
  parseInfo(data, "../../client/data/maps/map");
}

function parseClient(data, destination) {
  const map = JSON.stringify(
    processMap(data, {
      mode: "client"
    })
  );

  fs.writeFile(destination + ".json", map, function(err, file) {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.info("[Client] Map saved at: " + destination + ".json");
    }
  });
}

function parseServer(data, destination) {
  const map = JSON.stringify(
    processMap(data, {
      mode: "server"
    })
  );

  fs.writeFile(destination + ".json", map, function(err, file) {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.info("[Server] Map saved at: " + destination + ".json");
    }
  });
}

function parseInfo(data, destination) {
  let map = JSON.stringify(
    processMap(data, {
      mode: "info"
    })
  );

  fs.writeFile(destination + ".json", map, function(err, file) {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.info("[Client] Map saved at: " + destination + ".json");
    }
  });

  map = "let mapData = " + map;

  fs.writeFile(destination + ".js", map, function(err, file) {
    if (err) {
      log.error(JSON.stringify(err));
    } else {
      log.info("[Client] Map saved at: " + destination + ".js");
    }
  });
}

getMap();
