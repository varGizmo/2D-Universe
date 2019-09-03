import * as _ from "underscore";
import * as fs from "fs";
import file from "../../shared/js/file";
import * as path from "path";
import Pos from "./pos";
import Utils from "./utils";
import Checkpoint from "./checkpoint";
import Area from "./area";

export default class Map {
  isLoaded: boolean;
  width: any;
  height: any;
  collisions: any;
  mobAreas: any;
  chestAreas: any;
  staticChests: any;
  staticEntities: any;
  zoneWidth!: number;
  zoneHeight!: number;
  groupWidth!: number;
  groupHeight!: number;
  readyFunc: any;
  grid!: any[];
  connectedGroups: any;
  checkpoints!: {
    [key: string]: any;
  };
  startingAreas!: any[];
  pvpAreas!: any[];
  constructor(filepath: string | number | Buffer | import("url").URL) {
    this.isLoaded = false;

    file.exists(filepath, (exists: any) => {
      if (!exists) {
        console.error(filepath + " doesn't exist.");
        return;
      }

      fs.readFile(filepath, (err, file) => {
        let json = JSON.parse(file.toString());

        this.initMap(json);
      });
    });
  }

  initMap(thismap: {
    width: any;
    height: any;
    collisions: any;
    roamingAreas: any;
    chestAreas: any;
    staticChests: any;
    staticEntities: any;
    doors: any;
    checkpoints: any;
    pvpAreas: any;
  }) {
    this.width = thismap.width;
    this.height = thismap.height;
    this.collisions = thismap.collisions;
    this.mobAreas = thismap.roamingAreas;
    this.chestAreas = thismap.chestAreas;
    this.staticChests = thismap.staticChests;
    this.staticEntities = thismap.staticEntities;
    this.isLoaded = true;

    // zone groups
    this.zoneWidth = 28;
    this.zoneHeight = 12;
    this.groupWidth = Math.floor(this.width / this.zoneWidth);
    this.groupHeight = Math.floor(this.height / this.zoneHeight);

    this.initConnectedGroups(thismap.doors);
    this.initCheckpoints(thismap.checkpoints);
    this.initPVPAreas(thismap.pvpAreas);

    if (this.readyFunc) {
      this.readyFunc();
    }
  }

  ready(f: any) {
    this.readyFunc = f;
  }

  tileIndexToGridPosition(tileNum: number) {
    let x = 0;
    let y = 0;

    let getX = (num: number, w: number) => {
      if (num === 0) {
        return 0;
      }
      return num % w === 0 ? w - 1 : (num % w) - 1;
    };

    tileNum -= 1;
    x = getX(tileNum + 1, this.width);
    y = Math.floor(tileNum / this.width);

    return { x: x, y: y };
  }

  GridPositionToTileIndex(x: number, y: number) {
    return y * this.width + x + 1;
  }

  generateCollisionGrid() {
    this.grid = [];

    if (this.isLoaded) {
      let tileIndex = 0;
      for (let j, i = 0; i < this.height; i++) {
        this.grid[i] = [];
        for (j = 0; j < this.width; j++) {
          if (_.include(this.collisions, tileIndex)) {
            this.grid[i][j] = 1;
          } else {
            this.grid[i][j] = 0;
          }
          tileIndex += 1;
        }
      }
      console.debug("Collision grid generated.");
    }
  }

  isOutOfBounds(x: number, y: number) {
    return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
  }

  isColliding(x: number, y: number) {
    if (this.isOutOfBounds(x, y)) {
      return false;
    }
    return this.grid[y][x] === 1;
  }
  isPVP(x: any, y: any) {
    let area = null;
    area = _.detect(this.pvpAreas, (area: any) => {
      return area.contains(x, y);
    });
    if (area) {
      return true;
    } else {
      return false;
    }
  }

  GroupIdToGroupPosition(id: string) {
    let posArray = id.split("-");

    return new Pos(parseInt(posArray[0], 10), parseInt(posArray[1], 10));
  }

  forEachGroup(cb: (arg0: string) => void) {
    let width = this.groupWidth;
    let height = this.groupHeight;

    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        cb(x + "-" + y);
      }
    }
  }

  getGroupIdFromPosition(x: number, y: number) {
    let w = this.zoneWidth;
    let h = this.zoneHeight;
    let gx = Math.floor((x - 1) / w);
    let gy = Math.floor((y - 1) / h);

    return gx + "-" + gy;
  }

  getAdjacentGroupPositions(id: string) {
    let position = this.GroupIdToGroupPosition(id);
    let x = position.x;
    let y = position.y;
    // surrounding groups
    let list = [
      new Pos(x - 1, y - 1),
      new Pos(x, y - 1),
      new Pos(x + 1, y - 1),
      new Pos(x - 1, y),
      new Pos(x, y),
      new Pos(x + 1, y),
      new Pos(x - 1, y + 1),
      new Pos(x, y + 1),
      new Pos(x + 1, y + 1)
    ];

    // groups connected via doors
    _.each(this.connectedGroups[id], (position: Pos) => {
      // don't add a connected group if it's already part of the surrounding ones.
      if (
        !_.any(list, groupPos => {
          return groupPos.equals(position);
        })
      ) {
        list.push(position);
      }
    });

    return _.reject(list, pos => {
      return (
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x >= this.groupWidth ||
        pos.y >= this.groupHeight
      );
    });
  }

  forEachAdjacentGroup(groupId: any, cb: (arg0: string) => void) {
    if (groupId) {
      _.each(this.getAdjacentGroupPositions(groupId), pos => {
        cb(pos.x + "-" + pos.y);
      });
    }
  }

  initConnectedGroups(doors: _.List<unknown>) {
    this.connectedGroups = {};
    _.each(doors, (door: any) => {
      let groupId = this.getGroupIdFromPosition(door.x, door.y);
      let connectedGroupId = this.getGroupIdFromPosition(door.tx, door.ty);
      let connectedPosition = this.GroupIdToGroupPosition(connectedGroupId);

      if (groupId in this.connectedGroups) {
        this.connectedGroups[groupId].push(connectedPosition);
      } else {
        this.connectedGroups[groupId] = [connectedPosition];
      }
    });
  }

  initCheckpoints(cpList: _.List<unknown>) {
    this.checkpoints = {};
    this.startingAreas = [];

    _.each(cpList, (cp: any) => {
      let checkpoint = new Checkpoint(cp.id, cp.x, cp.y, cp.w, cp.h);
      this.checkpoints[checkpoint.id] = checkpoint;
      if (cp.s === 1) {
        this.startingAreas.push(checkpoint);
      }
    });
  }

  getCheckpoint(id: string) {
    return this.checkpoints[id];
  }

  getRandomStartingPosition() {
    let nbAreas = _.size(this.startingAreas),
      i = Utils.randomInt(0, nbAreas - 1),
      area = this.startingAreas[i];

    return area.getRandomPosition();
  }
  initPVPAreas(pvpList: any[]) {
    this.pvpAreas = [];
    _.each(pvpList, pvp => {
      let pvpArea = new Area(pvp.id, pvp.x, pvp.y, pvp.w, pvp.h, null);
      this.pvpAreas.push(pvpArea);
    });
  }
}
