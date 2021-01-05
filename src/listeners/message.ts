import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import urlRegexSafe from "url-regex-safe";
import AutoModModel from "../models/AutoModModel";

const nWordRegExp = new RegExp("n[i1]gg?[e3]r[s\\$]?");
const nWordRegExp2 = new RegExp("nniigg");

export default class message extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      type: "on",
    });
  }

  public async exec(message: Message) {
    await message.guild.members.fetch();
    const autoModModel = getModelForClass(AutoModModel);
    const guildSettings = await autoModModel.findOne({ guildId: message.guild.id });
    if (!guildSettings.autoModSettings.exemptRoles.find((t) => t === message.member.roles.cache.findKey((r) => r.id === t))) {
      if (guildSettings.autoModSettings.filterURLs) {
        if (message.content.match(urlRegexSafe({ strict: true }))) {
          message.delete();
        }
      }
      if (guildSettings.autoModSettings.messageLengthLimit > 1 ?? guildSettings.autoModSettings.messageLengthLimit !== null) {
        if (message.content.length >= guildSettings.autoModSettings.messageLengthLimit) {
          message.delete();
        }
      }
      if (guildSettings.autoModSettings.nWordFilter) {
        if (message.content.match(nWordRegExp) ?? message.content.match(nWordRegExp2)) {
          message.delete();
        }
      }
    }
  }
}
