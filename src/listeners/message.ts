import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import AfkModel from "../models/AfkModel";
import AutoModModel from "../models/AutoModModel";
import {
  dispatchAfkEmbed,
  dispatchAutoModMsg,
  autoModWarn,
  dispatchAfkWelcomeEmbed,
} from "../structures/Utils";
import urlRegexSafe from "url-regex-safe";

const nWordPattern2 = new RegExp("nniigg");
const nWordPattern = new RegExp("n[i1]gg?[e3]r[s\\$]?");

export default class message extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      type: "on",
    });
  }

  public async exec(message: Message) {
    await message.guild.members.fetch({ time: 20000 });
    const afkModel = getModelForClass(AfkModel);
    if (message.mentions.members.first()) {
      const current_user_afk = await afkModel.findOne({
        userId: message.mentions.members.first().id,
      });
      if (current_user_afk.afk.isAfk) {
        return await dispatchAfkEmbed(message, current_user_afk.afk.status, message.mentions.members.first());
      }
    } else {
      const current_user_afk = await afkModel.findOne({
        userId: message.author.id
      })
      if (!message.content.startsWith(`${this.client.commandHandler.prefix}afk`) && current_user_afk.afk.status) {
        await afkModel.findOneAndDelete({ userId: message.author.id });
        return await dispatchAfkWelcomeEmbed(message, message.member);
      }
    }
    const autoModModel = getModelForClass(AutoModModel);
    const current_automod = await autoModModel.findOne({
      guildId: message.guild.id,
    });
    if (
      !current_automod.autoModSettings.exemptRoles.find((t) =>
        message.member.roles.cache.findKey((r) => r.id === t)
      )
    ) {
      if (current_automod.autoModSettings.filterURLs) {
        if (message.content.match(urlRegexSafe({ strict: true }))) {
          await message.delete();
          await autoModWarn(
            message.member,
            message.guild,
            "Sending Links",
            message,
            this.client
          );
          await dispatchAutoModMsg("Sending Links", message, "Warned");
        }
      }
      if (current_automod.autoModSettings.messageLengthLimit > 1) {
        if (message.content.length >= current_automod.autoModSettings.messageLengthLimit) {
          await message.delete();
          await autoModWarn(
            message.member,
            message.guild,
            "Text Spam",
            message,
            this.client
          );
          await dispatchAutoModMsg("Text Spam", message, "Warned");
        }
      }
      if (current_automod.autoModSettings.nWordFilter) {
        if (message.content.match(nWordPattern ?? nWordPattern2)) {
          await message.delete();
          await autoModWarn(
            message.member,
            message.guild,
            "N Word",
            message,
            this.client
          );
          await dispatchAutoModMsg("N Word", message, "Warned");
        }
      }
      if (current_automod.autoModSettings.mentionLimit > 1) {
        if (message.mentions.users.size > current_automod.autoModSettings.mentionLimit ?? message.mentions.members.size > current_automod.autoModSettings.mentionLimit) {
          await message.delete();
          await autoModWarn(
            message.member,
            message.guild,
            "Mass Mentioning Users",
            message,
            this.client
          );
          await dispatchAutoModMsg("Mass Mentioning Users", message, "Warned");
        }
      }
      if (current_automod.autoModSettings.soundPingFilter) {
        if (message.content.includes("<@!323431364340744192>")) {
          await message.delete();
          await autoModWarn(
            message.member,
            message.guild,
            "Mentioning Sound",
            message,
            this.client
          );
          await dispatchAutoModMsg("Mentioning Sounddrout", message, "Warned");
        }
      }
    }
  }
}
