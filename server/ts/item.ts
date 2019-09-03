import Entity from "./entity";

export default class Item extends Entity {
  setItems(items: any) {
    throw new Error("Method not implemented.");
  }
  isFromChest: boolean;
  blinkTimeout: any;
  isStatic: boolean;
  despawnTimeout: any;
  respawn_cb: any;
  constructor(id: string, kind: any, x: number, y: number) {
    super(id, "item", kind, x, y);
    this.isStatic = false;
    this.isFromChest = false;
  }

  handleDespawn(params: { [key: string]: any }) {
    this.blinkTimeout = setTimeout(() => {
      params.blinkCallback();
      this.despawnTimeout = setTimeout(
        params.despawnCallback,
        params.blinkingDuration
      );
    }, params.beforeBlinkDelay);
  }

  destroy() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    if (this.despawnTimeout) {
      clearTimeout(this.despawnTimeout);
    }

    if (this.isStatic) {
      this.scheduleRespawn(30000);
    }
  }

  scheduleRespawn(delay: number) {
    setTimeout(() => {
      if (this.respawn_cb) {
        this.respawn_cb();
      }
    }, delay);
  }

  onRespawn(cb: any) {
    this.respawn_cb = cb;
  }
}
