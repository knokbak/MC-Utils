import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import config from "../../config";
import { modLog, findChannel } from "../../structures/Utils";
import utc from "moment";
import Logger from "../../structures/Logger";
import memberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Ban extends Command {
  public constructor() {
    super("ban", {
      aliases: ["ban"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Bans a member in the server.",
        usage: "ban [ID or Mention] <reason>",
        examples: ["ban @Axis#0001", "ban 203940220939"],
      },
      ratelimit: 3,
      userPermissions: ["BAN_MEMBERS"],
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a member to ban...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member to ban...`,
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

    if (
      member.roles.highest.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerID
    ) {
      embed.setDescription(
        `You cannot ban a member with a role superior (or equal) to yours!`
      );
      return message.util.send(embed);
    }

    if (!member.bannable) {
      embed.setDescription(
        "You cannot ban this user as they are considered not bannable."
      );
      return message.util.send(embed);
    }

    if (
      member.hasPermission("ADMINISTRATOR") ||
      member.hasPermission("MANAGE_GUILD")
    ) {
      embed.setDescription(
        `You cannot ban this user as they have the \`ADMINISTRATOR\` or \`MANAGE_GUILD\` permission.`
      );
      return message.util.send(embed);
    }

    if (member.id === message.guild.ownerID) {
      embed.setDescription(
        `You cannot ban this person as the person is the guild owner.`
      );
      return message.util.send(embed);
    }

    member
      .ban({ reason: reason })
      .catch((e) => {
        embed.setDescription(`An error occurred whilst banning: \`${e}\``);
        return message.util.send(embed);
      })
      .then(async () => {
        let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
        let userId = member.id;
        let guildID = message.guild.id;

        let caseNum = Math.random().toString(16).substr(2, 8);
        const caseInfo = {
          caseID: caseNum,
          channel: message.channel.id,
          moderator: message.author.id,
          user: `${member.user.tag} (${member.user.id})`,
          date: dateString,
          type: "Ban",
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
          ).catch((e) => message.channel.send(`Error Logging Kick to DB: ${e}`));
        } catch(e) {
          Logger.error("DB", e);
        }

        embed.setDescription(`Banned **${member.user.tag}** | \`${caseNum}\``);
        message.channel.send(embed);

        const logEmbed = new MessageEmbed()
          .setTitle(`Member Banned | Case \`${caseNum}\` | ${member.user.tag}`)
          .addField(`User:`, `<@${member.id}>`, true)
          .addField(`Moderator:`, `<@${message.author.id}>`, true)
          .addField(`Reason:`, reason, true)
          .setFooter(`ID: ${member.id} | ${dateString}`)
          .setColor("RED");

        let modlogChannel = findChannel(
          this.client,
          config.channels.modLogChannel
        );
        modLog(modlogChannel, logEmbed, message.guild.iconURL());
      });
  }
}
