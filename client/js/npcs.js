
define(['npc'], function(NPC) {

    var NPCs = {

        Guard: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.GUARD, 1);
            }
        }),

        King: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.KING, 1);
            }
        }),

        Agent: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.AGENT, 1);
            }
        }),

        Rick: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.RICK, 1);
            }
        }),

        VillageGirl: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.VILLAGEGIRL, 1);
            }
        }),

        Villager: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.VILLAGER, 1);
            }
        }),

        Coder: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.CODER, 1);
            }
        }),

        Scientist: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.SCIENTIST, 1);
            }
        }),

        Nyan: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.NYAN, 1);
                this.idleSpeed = 50;
            }
        }),

        Sorcerer: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.SORCERER, 1);
                this.idleSpeed = 150;
            }
        }),

        Priest: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.PRIEST, 1);
            }
        }),

        BeachNPC: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.BEACHNPC, 1);
            }
        }),

        ForestNPC: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.FORESTNPC, 1);
            }
        }),

        DesertNPC: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.DESERTNPC, 1);
            }
        }),

        LavaNPC: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.LAVANPC, 1);
            }
        }),

        Octocat: NPC.extend({
            init: function(id) {
                this._super(id, Types.Entities.OCTOCAT, 1);
            }
        })
    };

    return NPCs;
});
