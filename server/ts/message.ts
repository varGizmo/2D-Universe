import * as _ from "underscore";
import Types from "../../shared/js/gametypes";

// TODO: Guilds, PVP

class Spawn {
  entity: any;
  constructor(entity: any) {
    this.entity = entity;
  }
  serialize() {
    var spawn = [Types.Messages.SPAWN];
    return spawn.concat(this.entity.getState());
  }
}

class Despawn {
  entityId: any;
  constructor(entityId: any) {
    this.entityId = entityId;
  }
  serialize() {
    return [Types.Messages.DESPAWN, this.entityId];
  }
}

class Move {
  entity: any;
  constructor(entity: any) {
    this.entity = entity;
  }
  serialize() {
    return [Types.Messages.MOVE, this.entity.id, this.entity.x, this.entity.y];
  }
}

class LootMove {
  entity: any;
  item: any;
  constructor(entity: any, item: any) {
    this.entity = entity;
    this.item = item;
  }
  serialize() {
    return [Types.Messages.LOOTMOVE, this.entity.id, this.item.id];
  }
}

class Attack {
  attackerId: any;
  targetId: any;
  constructor(attackerId: any, targetId: any) {
    this.attackerId = attackerId;
    this.targetId = targetId;
  }
  serialize() {
    return [Types.Messages.ATTACK, this.attackerId, this.targetId];
  }
}

class Health {
  points: any;
  isRegen: any;
  constructor(points: any, isRegen: any) {
    this.points = points;
    this.isRegen = isRegen;
  }
  serialize() {
    var health = [Types.Messages.HEALTH, this.points];

    if (this.isRegen) {
      health.push(1);
    }
    return health;
  }
}

class HitPoints {
  maxHitPoints: any;
  constructor(maxHitPoints: any) {
    this.maxHitPoints = maxHitPoints;
  }
  serialize() {
    return [Types.Messages.HP, this.maxHitPoints];
  }
}

class EquipItem {
  playerId: any;
  itemKind: any;
  constructor(player: { id: any }, itemKind: any) {
    this.playerId = player.id;
    this.itemKind = itemKind;
  }
  serialize() {
    return [Types.Messages.EQUIP, this.playerId, this.itemKind];
  }
}

class Drop {
  mob: any;
  item: any;
  constructor(mob: any, item: any) {
    this.mob = mob;
    this.item = item;
  }
  serialize() {
    var drop = [
      Types.Messages.DROP,
      this.mob.id,
      this.item.id,
      this.item.kind,
      _.pluck(this.mob.hatelist, "id")
    ];

    return drop;
  }
}

class Chat {
  playerId: any;
  message: any;
  constructor(player: { id: any }, message: any) {
    this.playerId = player.id;
    this.message = message;
  }
  serialize() {
    return [Types.Messages.CHAT, this.playerId, this.message];
  }
}

class Teleport {
  entity: any;
  constructor(entity: any) {
    this.entity = entity;
  }
  serialize() {
    return [
      Types.Messages.TELEPORT,
      this.entity.id,
      this.entity.x,
      this.entity.y
    ];
  }
}

class Damage {
  entity: any;
  points: any;
  constructor(entity: any, points: any, hitPoints?: any, maxHitPoints?: any) {
    this.entity = entity;
    this.points = points;
  }
  serialize() {
    return [Types.Messages.DAMAGE, this.entity.id, this.points];
  }
}

class Population {
  world: any;
  total: any;
  constructor(world: any, total?: any) {
    this.world = world;
    this.total = total;
  }
  serialize() {
    return [Types.Messages.POPULATION, this.world, this.total];
  }
}

class Kill {
  mob: any;
  constructor(mob: any, level?: any, experience?: any) {
    this.mob = mob;
  }
  serialize() {
    return [Types.Messages.KILL, this.mob.kind];
  }
}

class List {
  ids: any;
  constructor(ids: any) {
    this.ids = ids;
  }
  serialize() {
    var list = this.ids;

    list.unshift(Types.Messages.LIST);
    return list;
  }
}

class Destroy {
  entity: any;
  constructor(entity: any) {
    this.entity = entity;
  }
  serialize() {
    return [Types.Messages.DESTROY, this.entity.id];
  }
}

class Blink {
  item: any;
  constructor(item: any) {
    this.item = item;
  }
  serialize() {
    return [Types.Messages.BLINK, this.item.id];
  }
}

export default {
  Spawn,
  Despawn,
  Move,
  LootMove,
  Attack,
  Health,
  HitPoints,
  EquipItem,
  Drop,
  Chat,
  Teleport,
  Damage,
  Population,
  Kill,
  List,
  Destroy,
  Blink
};
