import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { findChannel, modLog, sendLogToChannel } from "../../structures/Utils";
import config from "../../config";
import { utc } from "moment";
import Logger from "../../structures/Logger";
import memberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Warn extends Command {
  public constructor() {
    super("warn", {
      aliases: ["warn"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Warn a member in the server.",
        usage: "warn [ID or Mention] <reason>",
        examples: ["warn @Axis#0001", "warn 20304092002934 swearing"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "member",
          type: "member" ?? "memberMention",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a member to warn...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member to warn...`,
          },
        },
        {
          id: "reason",
          type: "string",
          match: "rest",
          default: "No reason provided.",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    // if (member.id === message.author.id) {
    //   embed.setDescription("You cannot warn yourself!");
    //   return message.util.send(embed);
    // }
    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (
      message.member.guild.ownerID !== message.author.id &&
      !(moderationPosition >= memberPosition)
    ) {
      embed.setDescription(
        `You cannot warn a member with a role superior (or equal) to yours!`
      );
      await message.util.send(embed);
      return;
    }
    let caseNum = Math.random().toString(16).substr(2, 8);
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
    let userId = member.id;
    let guildID = message.guild.id;

    const caseInfo = {
      caseID: caseNum,
      moderator: message.author.tag,
      user: `${member.user.tag} (${member.user.id})`,
      date: dateString,
      type: "Warn",
      reason,
    };

    const sanctionsModel = getModelForClass(memberModel);
    try {
      await sanctionsModel.findOneAndUpdate(
        {
          guildId: guildID,
          id: userId
        },
        {
          guildId: guildID,
          id: userId,
          $push: {
            sanctions: caseInfo
          }
        },
        {
          upsert: true
        }
      ).catch((e) => message.channel.send(`Error Logging Warn to DB: ${e}`));
    } catch(e) {
      Logger.error("DB", e);
    }

    embed.setDescription(`Warned **${member.user.tag}** | \`${caseNum}\``);

    await sendLogToChannel(this.client, member, message.guild.id);

    const logEmbed = new MessageEmbed()
      .setTitle(`Member Warned | Case \`${caseNum}\` | ${member.user.tag}`)
      .addField(`User:`, `<@${member.id}>`, true)
      .addField(`Moderator:`, `<@${message.author.id}>`, true)
      .addField(`Reason:`, reason, true)
      .setFooter(`ID: ${member.id} | ${dateString}`)
      .setColor("ORANGE");

    let modlogChannel = findChannel(this.client, config.channels.modLogChannel);
    await modLog(modlogChannel, logEmbed, message.guild.iconURL());
    return message.util.send(embed);
  }
}
