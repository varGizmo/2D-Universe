import * as _ from "underscore";
import Messages from "./message";
import Utils from "./utils";
import FormatChecker from "./format";
const { check } = new FormatChecker();
import Types from "../../shared/js/gametypes";
import Player from "./player";

export default class Guild {
  members: { [key: string]: any };
  sentInvites: { [key: string]: any };
  id: any;
  name: any;
  server: any;
  constructor(id: any, name: any, server: any) {
    this.members = {}; //playerid:playername
    this.sentInvites = {}; //time
    this.id = id;
    this.name = name;
    this.server = server;

    // TODO: have a history variable to advise users of what happened while they were offline ? wait for DB…
    // with DB also update structure to make members permanent
  }
  addMember(player: Player, reply: boolean) {
    if (typeof this.members[player.id] !== "undefined") {
      console.error(
        "Add to guild: player conflict (" + player.id + " already exists)"
      );
      this.deleteInvite(player.id);
      return false;
    } else {
      //When guildRules is created, use here (or in invite)
      var proceed = true;
      if (typeof reply !== "undefined") {
        proceed = this.checkInvite(player) && reply;
        if (reply === false) {
          this.server.pushToGuild(
            this,
            //@ts-ignore
            new Messages.Guild(Types.Messages.GUILDACTION.JOIN, [
              player.name,
              false
            ]),
            player
          );
          this.deleteInvite(player.id);
          return false;
        }
      }
      if (proceed) {
        this.members[player.id] = player.name;
        player.setGuildId(this.id);
        this.server.pushToGuild(
          this,
          //@ts-ignore
          new Messages.Guild(Types.Messages.GUILDACTION.POPULATION, [
            this.name,
            this.onlineMemberCount()
          ])
        );
        if (typeof reply !== "undefined") {
          this.server.pushToGuild(
            this,
            //@ts-ignore
            new Messages.Guild(Types.Messages.GUILDACTION.JOIN, [
              player.name,
              player.id,
              this.id,
              this.name
            ])
          );
          this.deleteInvite(player.id);
        }
      }
      return player.id;
    }
  }

  invite(invitee: Player, invitor: Player) {
    if (typeof this.members[invitee.id] !== "undefined") {
      this.server.pushToPlayer(
        invitor,
        //@ts-ignore
        new Messages.GuildError(
          Types.Messages.GUILDERRORTYPE.BADINVITE,
          invitee.name
        )
      );
    } else {
      this.sentInvites[invitee.id] = new Date().valueOf();
      this.server.pushToPlayer(
        invitee,
        //@ts-ignore
        new Messages.Guild(Types.Messages.GUILDACTION.INVITE, [
          this.id,
          this.name,
          invitor.name
        ])
      );
    }
  }

  deleteInvite(inviteeId: string) {
    delete this.sentInvites[inviteeId];
  }

  checkInvite(invitee: Player) {
    var now = new Date().valueOf();
    _.each(this.sentInvites, (time, id) => {
      if (now - time > 600000) {
        var belated = this.server.getEntityById(id);
        this.deleteInvite(id);
        this.server.pushToGuild(
          this,
          //@ts-ignore
          new Messages.Guild(Types.Messages.GUILDACTION.JOIN, belated.name),
          belated
        );
      }
    });
    return typeof this.sentInvites[invitee.id] !== "undefined";
  }

  removeMember(player: Player) {
    if (typeof this.members[player.id] !== undefined) {
      delete this.members[player.id];
      this.server.pushToGuild(
        this,
        //@ts-ignore
        new Messages.Guild(Types.Messages.GUILDACTION.POPULATION, [
          this.name,
          this.onlineMemberCount()
        ])
      );
      return true;
    } else {
      console.error(
        "Remove from guild: player conflict (" + player.id + " does not exist)"
      );
      return false;
    }
  }

  forEachMember(iterator: any) {
    _.each(this.members, iterator);
  }

  memberNames() {
    return _.map(this.members, name => {
      return name;
    });
  }

  onlineMemberCount() {
    return _.size(this.members);
  }
}
