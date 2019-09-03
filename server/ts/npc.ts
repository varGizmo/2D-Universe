import Entity from "./entity";

export default class NPCs extends Entity {
  constructor(id: string, kind: any, x: number, y: number) {
    super(id, "npc", kind, x, y);
  }
}
