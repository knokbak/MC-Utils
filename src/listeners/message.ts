import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import urlRegexSafe from "url-regex-safe";
import AutoModModel from "../models/AutoModModel";
import { autoModWarn, dispatchAutoModMsg } from "../structures/Utils";

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
    if (!guildSettings.autoModSettings.exemptRoles.find((t) => message.member.roles.cache.findKey((r) => r.id === t))) {
      if (guildSettings.autoModSettings.filterURLs !== null || guildSettings.autoModSettings.filterURLs !== false) {
        if (message.content.match(urlRegexSafe({ strict: true }))) {
          autoModWarn(message.member, message.guild, "Sending Links", "You are not allowed to send links.", message, this.client);
          message.delete();
          await dispatchAutoModMsg("Sending Links", message, "Warned");
        }
      }
      if (guildSettings.autoModSettings.messageLengthLimit > 1 || guildSettings.autoModSettings.messageLengthLimit !== null) {
        if (message.content.length >= guildSettings.autoModSettings.messageLengthLimit) {
          autoModWarn(message.member, message.guild, "Sending Wall Text", "You are not allowed to send huge text blocks.", message, this.client);
          message.delete();
          await dispatchAutoModMsg("Sending Wall Text", message, "Warned");
        }
      }
      if (guildSettings.autoModSettings.nWordFilter !== null || guildSettings.autoModSettings.nWordFilter !== false) {
        if (message.content.match(nWordRegExp) ?? message.content.match(nWordRegExp2)) {
          message.delete();
        }
      }
      if (guildSettings.autoModSettings.mentionLimit !== null || guildSettings.autoModSettings.mentionLimit > 1) {
        if (message.mentions.users.size > guildSettings.autoModSettings.mentionLimit || message.mentions.members.size > guildSettings.autoModSettings.mentionLimit) {
          autoModWarn(message.member, message.guild, "Mentioning Users", "Mentioning many users.", message, this.client);
          message.delete();
          await dispatchAutoModMsg("Mentioning Users", message, "Warned");
        }
      }
      if (guildSettings.autoModSettings.soundPingFilter !== null || guildSettings.autoModSettings.soundPingFilter !== false) {
        if (message.content.includes("<@!323431364340744192>")) {
          autoModWarn(message.member, message.guild, "Mentioning Sound", "You are not allowed to mention Sound.", message, this.client);
          message.delete();
          await dispatchAutoModMsg("Mentioning Sounddrout", message, "Warned");
        }
      }
    }
  }
}
