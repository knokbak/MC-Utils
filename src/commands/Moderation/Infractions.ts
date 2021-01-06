import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { getModelForClass } from "@typegoose/typegoose";
import MemberModel from "../../models/MemberModel";
import AutoModModel from "../../models/AutoModModel";

export default class Infractions extends Command {
  public constructor() {
    super("infractions", {
      aliases: ["infractions", "modlogs", "warnings"],
      category: "Moderation",
      channel: "guild",
      userPermissions: ["MANAGE_MESSAGES"],
      description: {
        content: "Check infractions (modlogs) of a member.",
        usage: "infractions <-a true/false> [ID or Mention]",
        examples: ["infractions @Axis#0001", "infractions 379420154955825153", "infractions -a true 379420154955825153"],
      },
      ratelimit: 3,
      args: [
        {
          id: "automod",
          flag: "-a ",
          match: "option",
          default: "false",
        },
        {
          id: "member",
          type: "member",
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { member, automod }: { member: GuildMember; automod: string; }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    let userId = member.id;
    if (automod === "true") {
      const autoModel = getModelForClass(AutoModModel);
      try {
        var autoMemberData = await autoModel.findOne({
          userId: userId,
          guildId: message.guild.id,
        });
        if (!autoMemberData) {
          embed.setColor(0xff0000);
          embed.setDescription(`No auto mod modlogs found for that user`);
          return message.util.send(embed);
        } else if (
          autoMemberData.sanctions === null ??
          autoMemberData.sanctions.length < 1 ??
          autoMemberData.sanctions === undefined
        ) {
          embed.setColor(0xff0000);
          embed.setDescription(`No auto mod modlogs found for that user`);
          return message.util.send(embed);
        }
      } catch (e) {}
      embed.setAuthor(
        `${member.user.tag}'s Modlogs`,
        member.user.displayAvatarURL({ dynamic: true })
      );
      embed.setDescription("All times are in UTC");
      const CASE_SUMMARY_REASON_MAX_LENGTH = 16;
      for (const s of autoMemberData.sanctions) {
        if (s.reason.length > CASE_SUMMARY_REASON_MAX_LENGTH) {
          const match = s.reason
            .slice(CASE_SUMMARY_REASON_MAX_LENGTH, 100)
            .match(/(?:[.,!?\s]|$)/);
          const nextWhitespaceIndex = match
            ? CASE_SUMMARY_REASON_MAX_LENGTH + match.index!
            : CASE_SUMMARY_REASON_MAX_LENGTH;
          if (nextWhitespaceIndex < s.reason.length) {
            s.reason = s.reason.slice(0, nextWhitespaceIndex - 1) + "...";
          }
        }
        embed.addField(
          `${s.type}: \`${s.caseID}\``,
          `Moderator: **<@!${s.moderatorId}>**\nReason: **${s.reason}**\nDate: **${s.date}**`,
          true
        );
      }
      embed.setFooter(`ID: ${userId}`);
      return message.util.send(embed);
    } else {
      const sanctionsModel = getModelForClass(MemberModel);
      try {
        var memberData = await sanctionsModel.findOne({
          userId: userId,
          guildId: message.guild.id,
        });
        if (!memberData) {
          embed.setColor(0xff0000);
          embed.setDescription(`No modlogs found for that user`);
          return message.util.send(embed);
        } else if (
          memberData.sanctions === null ??
          memberData.sanctions.length < 1 ??
          memberData.sanctions === undefined
        ) {
          embed.setColor(0xff0000);
          embed.setDescription(`No modlogs found for that user`);
          return message.util.send(embed);
        }
      } catch (e) {}
      embed.setAuthor(
        `${member.user.tag}'s Modlogs`,
        member.user.displayAvatarURL({ dynamic: true })
      );
      embed.setDescription("All times are in UTC");
      const CASE_SUMMARY_REASON_MAX_LENGTH = 16;
      for (const s of memberData.sanctions) {
        if (s.reason.length > CASE_SUMMARY_REASON_MAX_LENGTH) {
          const match = s.reason
            .slice(CASE_SUMMARY_REASON_MAX_LENGTH, 100)
            .match(/(?:[.,!?\s]|$)/);
          const nextWhitespaceIndex = match
            ? CASE_SUMMARY_REASON_MAX_LENGTH + match.index!
            : CASE_SUMMARY_REASON_MAX_LENGTH;
          if (nextWhitespaceIndex < s.reason.length) {
            s.reason = s.reason.slice(0, nextWhitespaceIndex - 1) + "...";
          }
        }
        embed.addField(
          `${s.type}: \`${s.caseID}\``,
          `Moderator: **<@!${s.moderatorId}>**\nReason: **${s.reason}**\nDate: **${s.date}**`,
          true
        );
      }
      embed.setFooter(`ID: ${userId}`);
      return message.util.send(embed);
    }
  }
}
