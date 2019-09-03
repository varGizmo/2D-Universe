"use strict";
exports.__esModule = true;
var _ = require("underscore");
var gametypes_1 = require("../../shared/js/gametypes");
var Spawn = (function () {
    function Spawn(entity) {
        this.entity = entity;
    }
    Spawn.prototype.serialize = function () {
        var spawn = [gametypes_1["default"].Messages.SPAWN];
        return spawn.concat(this.entity.getState());
    };
    return Spawn;
}());
var Despawn = (function () {
    function Despawn(entityId) {
        this.entityId = entityId;
    }
    Despawn.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.DESPAWN, this.entityId];
    };
    return Despawn;
}());
var Move = (function () {
    function Move(entity) {
        this.entity = entity;
    }
    Move.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.MOVE, this.entity.id, this.entity.x, this.entity.y];
    };
    return Move;
}());
var LootMove = (function () {
    function LootMove(entity, item) {
        this.entity = entity;
        this.item = item;
    }
    LootMove.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.LOOTMOVE, this.entity.id, this.item.id];
    };
    return LootMove;
}());
var Attack = (function () {
    function Attack(attackerId, targetId) {
        this.attackerId = attackerId;
        this.targetId = targetId;
    }
    Attack.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.ATTACK, this.attackerId, this.targetId];
    };
    return Attack;
}());
var Health = (function () {
    function Health(points, isRegen) {
        this.points = points;
        this.isRegen = isRegen;
    }
    Health.prototype.serialize = function () {
        var health = [gametypes_1["default"].Messages.HEALTH, this.points];
        if (this.isRegen) {
            health.push(1);
        }
        return health;
    };
    return Health;
}());
var HitPoints = (function () {
    function HitPoints(maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
    }
    HitPoints.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.HP, this.maxHitPoints];
    };
    return HitPoints;
}());
var EquipItem = (function () {
    function EquipItem(player, itemKind) {
        this.playerId = player.id;
        this.itemKind = itemKind;
    }
    EquipItem.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.EQUIP, this.playerId, this.itemKind];
    };
    return EquipItem;
}());
var Drop = (function () {
    function Drop(mob, item) {
        this.mob = mob;
        this.item = item;
    }
    Drop.prototype.serialize = function () {
        var drop = [
            gametypes_1["default"].Messages.DROP,
            this.mob.id,
            this.item.id,
            this.item.kind,
            _.pluck(this.mob.hatelist, "id")
        ];
        return drop;
    };
    return Drop;
}());
var Chat = (function () {
    function Chat(player, message) {
        this.playerId = player.id;
        this.message = message;
    }
    Chat.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.CHAT, this.playerId, this.message];
    };
    return Chat;
}());
var Teleport = (function () {
    function Teleport(entity) {
        this.entity = entity;
    }
    Teleport.prototype.serialize = function () {
        return [
            gametypes_1["default"].Messages.TELEPORT,
            this.entity.id,
            this.entity.x,
            this.entity.y
        ];
    };
    return Teleport;
}());
var Damage = (function () {
    function Damage(entity, points, hitPoints, maxHitPoints) {
        this.entity = entity;
        this.points = points;
    }
    Damage.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.DAMAGE, this.entity.id, this.points];
    };
    return Damage;
}());
var Population = (function () {
    function Population(world, total) {
        this.world = world;
        this.total = total;
    }
    Population.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.POPULATION, this.world, this.total];
    };
    return Population;
}());
var Kill = (function () {
    function Kill(mob, level, experience) {
        this.mob = mob;
    }
    Kill.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.KILL, this.mob.kind];
    };
    return Kill;
}());
var List = (function () {
    function List(ids) {
        this.ids = ids;
    }
    List.prototype.serialize = function () {
        var list = this.ids;
        list.unshift(gametypes_1["default"].Messages.LIST);
        return list;
    };
    return List;
}());
var Destroy = (function () {
    function Destroy(entity) {
        this.entity = entity;
    }
    Destroy.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.DESTROY, this.entity.id];
    };
    return Destroy;
}());
var Blink = (function () {
    function Blink(item) {
        this.item = item;
    }
    Blink.prototype.serialize = function () {
        return [gametypes_1["default"].Messages.BLINK, this.item.id];
    };
    return Blink;
}());
exports["default"] = {
    Spawn: Spawn,
    Despawn: Despawn,
    Move: Move,
    LootMove: LootMove,
    Attack: Attack,
    Health: Health,
    HitPoints: HitPoints,
    EquipItem: EquipItem,
    Drop: Drop,
    Chat: Chat,
    Teleport: Teleport,
    Damage: Damage,
    Population: Population,
    Kill: Kill,
    List: List,
    Destroy: Destroy,
    Blink: Blink
};
