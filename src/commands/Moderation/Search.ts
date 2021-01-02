import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { getModelForClass } from "@typegoose/typegoose";
import MemberModel from "../../models/MemberModel";

export default class Search extends Command {
  public constructor() {
    super("search", {
      aliases: ["search"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Check public infractions (modlogs) of your own user.",
        usage: "search",
        examples: ["search"],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    let userId = message.author.id;
    const sanctionsModel = getModelForClass(MemberModel);
    try {
      var memberData = await sanctionsModel.findOne({
        userId: userId,
        guildId: message.guild.id,
      });
      if (!memberData) {
        embed.setColor(0xff0000);
        embed.setDescription(`No modlogs found for you.`);
        return message.util.send(embed);
      } else if (
        memberData.sanctions === null ??
        memberData.sanctions.length < 1 ??
        memberData.sanctions === undefined
      ) {
        embed.setColor(0xff0000);
        embed.setDescription(`No modlogs found for you.`);
        return message.util.send(embed);
      }
    } catch (e) {}
    embed.setAuthor(
      `${message.author.tag}'s Modlogs`,
      message.author.displayAvatarURL({ dynamic: true })
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
        `Reason: **${s.reason}**\nDate: **${s.date}**`,
        true
      );
    }
    embed.setFooter(`ID: ${userId}`);
    return message.util.send(embed);
  }
}
