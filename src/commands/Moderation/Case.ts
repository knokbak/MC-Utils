import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import MemberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Case extends Command {
    public constructor() {
      super("case", {
        aliases: ["case"],
        category: "Moderation",
        channel: "guild",
        description: {
          content: "Shows details from a case.",
          usage: "case [ID]",
          examples: ["case 71ad8933"],
        },
        ratelimit: 3,
        userPermissions: ["MANAGE_MESSAGES"],
        args: [
          {
            id: "id",
            type: "string",
            prompt: {
              start: (msg: Message) =>
                `${msg.author}, please provide a valid case ID to show...`,
              retry: (msg: Message) =>
                `${msg.author}, please provide a valid case ID to show...`,
            },
          },
        ]
      });
    }

    public async exec(message: Message, { id }: { id: string }): Promise<void | Message> {
      const embed = new MessageEmbed().setColor(0x00ff0c);
      const sanctionsModel = getModelForClass(MemberModel);
      await sanctionsModel.findOne(
        { guildId: message.guild.id, "sanctions.caseID": id }
      )
        .then((e) => {
        if (!e.sanctions.filter(r => r.caseID === id)) {
          embed.setDescription(`Case is not valid.`);
          return message.util.send(embed);
        } else {
          const s = e.sanctions.filter(r => r.caseID === id)[0];
          embed.setAuthor(
            `Case - ${id}`,
            message.author.displayAvatarURL({ dynamic: true })
          );
          embed.setDescription("All times are in UTC");
          embed.addField(s.type, `Moderator: **${s.moderator}**\nUser: **${s.user}**\nReason: **${s.reason}**\nDate: **${s.date}**`)
          return message.util.send(embed);
        }
      });
    }
}
