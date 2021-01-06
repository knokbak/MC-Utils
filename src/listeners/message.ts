import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import urlRegexSafe from "url-regex-safe";
import AutoModModel from "../models/AutoModModel";
import config from "../config"
import uniqid from "uniqid";
import {
  dmUserOnInfraction,
  findChannel,
  modLog,
  sendLogToChannel,
} from "../structures/Utils";
import { MessageEmbed } from "discord.js";
import memberModel, { CaseInfo } from "../models/MemberModel";
import { utc } from "moment";
import Logger from "../structures/Logger";

const nWordRegExp = new RegExp("n[i1]gg?[e3]r[s\\$]?");
const nWordRegExp2 = new RegExp("nniigg");

async function autoModWarn(user, member, channel, guild, reason, display, type, message) {
  if (!member) return;
  let caseNum = uniqid(`A-`);
  let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
  let userId = member.id;
  let guildID = guild.id;
  const embed = new MessageEmbed().setColor(0x00ff0c);

  const caseInfo: CaseInfo = {
    caseID: caseNum,
    moderator: "AutoMod",
    moderatorId: "775733953050443818",
    user: `${member.user.tag} (${member.user.id})`,
    date: dateString,
    type: "Auto-Warn",
    reason,
  };

  const embedToSend = new MessageEmbed()
    .setColor(0x1abc9c)
    .setDescription(
      `Hello ${member.user.username},\nYou have been auto-warned in **${message.guild.name}** for **${reason}**.`
    );
    
  try {
    await dmUserOnInfraction(member.user, embedToSend);
  } catch (e) {
    embed.setColor(0xff0000);
    embed.setDescription("Couldn't send them a warn message! Continuing...");
    message.util.send(embed);
  }

  const sanctionsModel = getModelForClass(memberModel);
  try {
    await sanctionsModel
      .findOneAndUpdate(
        {
          guildId: guildID,
          userId: userId,
        },
        {
          guildId: guildID,
          userId: userId,
          $push: {
            sanctions: caseInfo,
          },
        },
        {
          upsert: true,
        }
      )
      .catch((e) => {
        embed.setColor(0xff0000);
        embed.setDescription(`Error Logging Warn to DB: ${e}`);
      });
  } catch (e) {
    Logger.error("DB", e);
  }
  embed.setDescription(`Warned **${member.user.tag}** | \`${caseNum}\``);
  await message.channel.send(embed);

  await sendLogToChannel(this.client, member, message.guild.id);

  const logEmbed = new MessageEmbed()
    .setTitle(`Member Auto-Warned | Case \`${caseNum}\` | ${member.user.tag}`)
    .addField(`User:`, `<@${member.id}>`, true)
    .addField(`Moderator:`, `AutoMod`, true)
    .addField(`Reason:`, reason, true)
    .setFooter(`ID: ${member.id} | ${dateString}`)
    .setColor("ORANGE");

  let modlogChannel = findChannel(this.client, config.channels.modLogChannel);
  modLog(modlogChannel, logEmbed, message.guild.iconURL());
}

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
      if (guildSettings.autoModSettings.soundPingFilter) {
        if(message.content.includes("<@323431364340744192>") ?? message.content.includes("<@!323431364340744192>")){
          message.delete()
        }
      }
    }
  }
}
