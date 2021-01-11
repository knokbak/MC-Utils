import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message, TextChannel } from "discord.js";
import AfkModel from "../models/AfkModel";
import AutoModModel from "../models/AutoModModel";
import {
  dispatchAfkEmbed,
  dispatchAutoModMsg,
  autoModWarn,
  dispatchAfkWelcomeEmbed,
} from "../structures/Utils";
import urlRegexSafe from "url-regex-safe";
import Logger from "../structures/Logger";
import date from "date.js";

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
    if (message.author.bot || !message.guild) return;
    const autoModModel = getModelForClass(AutoModModel);
    await autoModModel.findOneAndUpdate({ guildId: message.guild.id, userId: message.author.id }, { $inc: { msgCounter: 1 }, lastMsgDate: date("now") }, { upsert: true });
    const afkModel = getModelForClass(AfkModel); 
    if (message.mentions.members.first()) {
      const current_user_afk = await afkModel.findOne({
        userId: message.mentions.members.first().id,
      })
      if (current_user_afk !== null && current_user_afk.afk.isAfk) {
        return await dispatchAfkEmbed(message, current_user_afk.afk.status, message.mentions.members.first());
      }
    } else {
      const current_user_afk = await afkModel.findOne({
        userId: message.author.id
      })
      if (current_user_afk !== null && !message.content.startsWith(`${this.client.commandHandler.prefix}afk`) && current_user_afk.afk.status) {
        await afkModel.findOneAndDelete({ userId: message.author.id });
        return await dispatchAfkWelcomeEmbed(message, message.member);
      }
    }
    const current_automod = await autoModModel.findOne({
      guildId: message.guild.id,
    });
    if (
      current_automod !== null &&
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
          await autoModModel.findOneAndUpdate({ guildId: message.guild.id, userId: message.author.id }, { $inc: { counter: 1 } }, { upsert: true });
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
          await autoModModel.findOneAndUpdate({ guildId: message.guild.id, userId: message.author.id }, { $inc: { counter: 1 } }, { upsert: true });
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
          await autoModModel.findOneAndUpdate({ guildId: message.guild.id, userId: message.author.id }, { $inc: { counter: 1 } }, { upsert: true });
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
          await autoModModel.findOneAndUpdate({ guildId: message.guild.id }, { $inc: { counter: 1 } }, { upsert: true });
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
          await autoModModel.findOneAndUpdate({ guildId: message.guild.id, userId: message.author.id }, { $inc: { counter: 1 } }, { upsert: true });
          await dispatchAutoModMsg("Mentioning Sounddrout", message, "Warned");
        }
      }
    //   if (current_automod.autoModSettings.messageSpamCount) {
    //     if (current_automod.msgCounter > current_automod.autoModSettings.messageSpamCount && current_automod.lastMsgDate >= date("now", "-5s")) {
    //       const ch = <TextChannel>message.channel;
    //       try {
    //         ch.bulkDelete(current_automod.msgCounter);
    //       } catch (e) {
    //         Logger.error("Bulk Delete", e.message);
    //       }
    //       await autoModWarn(
    //         message.member,
    //         message.guild,
    //         "Spamming Text",
    //         message,
    //         this.client
    //       );
    //       await autoModModel.findOneAndUpdate({ guildId: message.guild.id }, { $inc: { msgCounter: 0 } }, { upsert: true });
    //       await autoModModel.findOneAndUpdate({ guildId: message.guild.id }, { $inc: { counter: 1 } }, { upsert: true });
    //       await dispatchAutoModMsg("Mentioning Sounddrout", message, "Warned");
    //     }
    //   }
    }
  }
}
