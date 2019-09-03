import * as sanitizer from "sanitizer";
import * as _ from "underscore";
import Types from "../../shared/js/gametypes";

export default {
  sanitizer,
  sanitize(string: string) {
    // Strip unsafe tags, then escape as html entities.
    return sanitizer.escape(sanitizer.sanitize(string));
  },
  random(range: number) {
    return Math.floor(Math.random() * range);
  },

  randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
  },

  randomInt(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min + 1));
  },

  clamp(min: number, max: number, value: number) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  },

  randomOrientation() {
    let o,
      r = this.random(4);

    if (r === 0) {
      o = Types.Orientations.LEFT;
    }
    if (r === 1) {
      o = Types.Orientations.RIGHT;
    }
    if (r === 2) {
      o = Types.Orientations.UP;
    }
    if (r === 3) {
      o = Types.Orientations.DOWN;
    }

    return o;
  },

  Mixin(
    target: { [x: string]: any },
    source: { [x: string]: any; hasOwnProperty?: any }
  ) {
    if (source) {
      for (let key, keys = Object.keys(source), l = keys.length; l--; ) {
        key = keys[l];

        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  },

  distanceTo(x: number, y: number, x2: number, y2: number) {
    let distX = Math.abs(x - x2),
      distY = Math.abs(y - y2);

    return distX > distY ? distX : distY;
  },

  NaN2Zero(num: number) {
    if (isNaN(num * 1)) {
      return 0;
    } else {
      return num * 1;
    }
  },

  trueFalse(bool: string) {
    return bool === "true" ? true : false;
  }
};
