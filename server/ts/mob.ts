import * as _ from "underscore";
import Character from "./character";
import ChestArea from "./chestarea";
import Messages from "./message";
import MobArea from "./mobarea";
import Properties from "./properties";
import Utils from "./utils";

export default class Mob extends Character {
  spawningX: number;
  spawningY: number;
  armorLevel: number;
  weaponLevel: number;
  anyhatelist!: any[];
  respawnTimeout: any;
  returnTimeout: any;
  isDead: boolean;
  hateCount: number;
  tankerlist: any[];
  area: any;
  respawnCallback: any;
  moveCallback: any;
  hatelist: any[];
  constructor(id: string, kind: any, x: number, y: number) {
    super(id, "mob", kind, x, y);

    this.updateHitPoints();
    this.spawningX = x;
    this.spawningY = y;
    this.armorLevel = Properties.getArmorLevel(this.kind);
    this.weaponLevel = Properties.getWeaponLevel(this.kind);
    this.hatelist = [];
    this.respawnTimeout = null;
    this.returnTimeout = null;
    this.isDead = false;
    this.hateCount = 0;
    this.tankerlist = [];
  }

  destroy() {
    this.isDead = true;
    this.hatelist = [];
    this.tankerlist = [];
    this.clearTarget();
    this.updateHitPoints();
    this.resetPosition();

    this.handleRespawn();
  }

  receiveDamage(points: number, playerId: any) {
    this.hitPoints -= points;
  }

  hates(playerId: any) {
    return _.any(this.hatelist, obj => {
      return obj.id === playerId;
    });
  }

  increaseHateFor(playerId: any, points: string | number) {
    if (this.hates(playerId)) {
      _.detect(this.hatelist, obj => {
        return obj.id === playerId;
      }).hate += points;
    } else {
      this.hatelist.push({ id: playerId, hate: points });
    }

    /*
        console.debug("Hatelist : "+this.id);
        _.each(this.hatelist, (obj) => {
            console.debug(obj.id + " -> " + obj.hate);
        });*/

    if (this.returnTimeout) {
      // Prevent the mob from returning to its spawning position
      // since it has aggroed a new player
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }
  }
  addTanker(playerId: any) {
    let i = 0;
    for (i = 0; i < this.tankerlist.length; i++) {
      if (this.tankerlist[i].id === playerId) {
        this.tankerlist[i].points++;
        break;
      }
    }
    if (i >= this.tankerlist.length) {
      this.tankerlist.push({ id: playerId, points: 1 });
    }
  }
  getMainTankerId() {
    let i = 0;
    let mainTanker = null;
    for (i = 0; i < this.tankerlist.length; i++) {
      if (mainTanker === null) {
        mainTanker = this.tankerlist[i];
        continue;
      }
      if (mainTanker.points < this.tankerlist[i].points) {
        mainTanker = this.tankerlist[i];
      }
    }

    if (mainTanker) {
      return mainTanker.id;
    } else {
      return null;
    }
  }

  getHatedPlayerId(hateRank: number) {
    let i,
      playerId,
      sorted = _.sortBy(this.hatelist, obj => {
        return obj.hate;
      }),
      size = _.size(this.hatelist);

    if (hateRank && hateRank <= size) {
      i = size - hateRank;
    } else {
      if (size === 1) {
        i = size - 1;
      } else {
        this.hateCount++;
        if (this.hateCount > size * 1.3) {
          this.hateCount = 0;
          i = size - 1 - Utils.random(size - 1);
          console.info("CHANGE TARGET: " + i);
        } else {
          return 0;
        }
      }
    }
    if (sorted && sorted[i]) {
      playerId = sorted[i].id;
    }

    return playerId;
  }

  forgetPlayer(playerId: any, duration?: any) {
    this.hatelist = _.reject(this.hatelist, obj => {
      return obj.id === playerId;
    });
    this.tankerlist = _.reject(this.tankerlist, obj => {
      return obj.id === playerId;
    });

    if (this.hatelist.length === 0) {
      this.returnToSpawningPosition(duration);
    }
  }

  forgetEveryone() {
    this.hatelist = [];
    this.tankerlist = [];
    this.returnToSpawningPosition(1);
  }

  drop(item: any) {
    if (item) {
      return new Messages.Drop(this, item);
    }
  }

  handleRespawn() {
    let delay = 30000;
    if (this.area && this.area instanceof MobArea) {
      // Respawn inside the area if part of a MobArea
      this.area.respawnMob(this, delay);
    } else {
      if (this.area && this.area instanceof ChestArea) {
        this.area.removeFromArea(this);
      }

      setTimeout(() => {
        if (this.respawnCallback) {
          this.respawnCallback();
        }
      }, delay);
    }
  }

  onRespawn(cb: any) {
    this.respawnCallback = cb;
  }

  resetPosition() {
    this.setPosition(this.spawningX, this.spawningY);
  }

  returnToSpawningPosition(waitDuration: number) {
    let delay = waitDuration || 4000;

    this.clearTarget();

    this.returnTimeout = setTimeout(() => {
      this.resetPosition();
      this.move(this.x, this.y);
    }, delay);
  }

  onMove(cb: any) {
    this.moveCallback = cb;
  }

  move(x: number, y: number) {
    this.setPosition(x, y);
    if (this.moveCallback) {
      this.moveCallback(this);
    }
  }

  updateHitPoints() {
    this.resetHitPoints(Properties.getHitPoints(this.kind));
  }

  distanceToSpawningPoint(x: number, y: number) {
    return Utils.distanceTo(x, y, this.spawningX, this.spawningY);
  }
}
