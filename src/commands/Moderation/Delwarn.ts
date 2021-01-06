import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import memberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class DelWarn extends Command {
  public constructor() {
    super("delwarn", {
      aliases: ["delwarn", "rmpunish"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Remove a warning or other infraction from a user.",
        usage: "delwarn [caseId]",
        examples: ["delwarn e0libeskjf7cyp3"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "id",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid case ID to delete...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid case ID to delete...`,
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
    { id, reason }: { id: string; reason: string }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x1abc9c);
    const sanctionsModel = getModelForClass(memberModel);
    try {
      var pendingDeletion = await sanctionsModel.findOne({
        guildId: message.guild.id,
        "sanctions.caseID": id,
      });
      if (!pendingDeletion.sanctions) {
        embed.setColor(0xff0000);
        embed.setDescription("No modlogs found for the user.");
        return message.util.send(embed);
      } else if (
        pendingDeletion.sanctions === null ??
        pendingDeletion.sanctions === undefined ??
        !pendingDeletion.sanctions.find((n) => n.caseID === id)
      ) {
        embed.setColor(0xff0000);
        embed.setDescription(`Couldn't find warn ID \`${id}\``);
        return message.util.send(embed);
      }
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription(`Couldn't find warn ID \`${id}\``);
      return message.util.send(embed);
    }
    if (
      pendingDeletion.sanctions.find(
        (r) => r.caseID === id && r.moderatorId !== message.author.id
      )
    ) {
      if (
        message.member.roles.cache.has("726771392913080421") ||
        message.member.permissions.has("ADMINISTRATOR") ||
        message.member.permissions.has("MANAGE_GUILD")
      ) {
        //Hmod Role OR Admin OR Manage Guild
        try {
          await sanctionsModel.updateOne(
            {
              guildId: message.guild.id,
              "sanctions.caseID": id,
            },
            {
              $pull: {
                sanctions: {
                  caseID: id,
                },
              },
            }
          );
          await message.util.send(`Case ID ${id} has been deleted.`);
        } catch (e) {
          embed.setColor(0xff0000);
          embed.setDescription(`Error occurred while deleting case: **${e}**`);
          return message.util.send(embed);
        }
      } else {
        embed.setColor(0xff0000);
        embed.setDescription(
          "You cannot delete this case because it is not yours."
        );
        return message.util.send(embed);
      }
    }
    try {
      await sanctionsModel.updateOne(
        {
          guildId: message.guild.id,
          "sanctions.caseID": id,
        },
        {
          $pull: {
            sanctions: {
              caseID: id,
            },
          },
        }
      );
      await message.delete();
      await message.util.send(`Case ID ${id} has been deleted.`);
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription(`Error occurred while deleting case: **${e}**`);
      return message.util.send(embed);
    }
  }
}
