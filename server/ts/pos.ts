export default class Pos {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(pos: this) {
    return pos.x == this.x && pos.y == this.y;
  }
}
