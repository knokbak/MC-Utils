import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import MemberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Reason extends Command {
  public constructor() {
    super("reason", {
      aliases: ["reason"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Changes a reason for the warn.",
        usage: "reason [caseId] [reason]",
        examples: ["case e0libeskjf7cuys Continued to be annoying."],
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
        {
            id: "reason",
            match: "rest",
            type: "string",
            prompt: {
                start: (msg: Message) =>
                  `${msg.author}, please provide a reason...`,
                retry: (msg: Message) =>
                  `${msg.author}, please provide a valid reason...`,
            },
        }
      ],
    });
  }

  public async exec(
    message: Message,
    { id, reason }: { id: string; reason: string; }
  ): Promise<void | Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    const sanctionsModel = getModelForClass(MemberModel);
    try {
      var sanctionsData = await sanctionsModel.findOne({
        guildId: message.guild.id,
        "sanctions.caseID": id,
      });
      if (
        !sanctionsData ??
        sanctionsData.sanctions === null ??
        sanctionsData.sanctions.length < 1 ??
        sanctionsData.sanctions === undefined
      ) {
        embed.setColor(0xff0000);
        embed.setDescription(`No modlogs found for that user.`);
        return message.util.send(embed);
      } else if (!sanctionsData.sanctions.find((r) => r.caseID === id)) {
        embed.setColor(0xff0000);
        embed.setDescription(`No case matching provided ID found.`);
        return message.util.send(embed);
      }
    } catch (e) {}
    const s = sanctionsData.sanctions.filter((r) => r.caseID === id)[0];
    try {
        await sanctionsModel.findOneAndUpdate(
            {
                guildId: message.guild.id,
                "sanctions.caseID": id,
            },
            {
                $pull: {
                    sanctions: {
                        reason: s.reason,
                    }
                },
                $push: {
                    sanctions: {
                        reason: reason
                    }
                }
            },
            { upsert: true }
        )
    } catch (e) {
        embed.setColor(0xff0000);
        embed.setDescription(`Couldn't update reason due to: **${e.message}**`);
        return message.util.send(embed);
    }
    embed.setDescription(`Update reason for **${id}** to **${reason}**`);
    return message.channel.send(embed);
  }
}
