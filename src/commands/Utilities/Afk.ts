import { getModelForClass } from "@typegoose/typegoose";
import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import AfkModel, { AfkStatus } from "../../models/AfkModel";

export default class Say extends Command {
  public constructor() {
    super("afk", {
      aliases: ["afk", "away"],
      channel: "guild",
      category: "Utilities",
      ratelimit: 2,
      description: {
        content: "Sets your AFK status and reason.",
        usage: "afk [reason]",
        examples: ["afk Away for a bit!", "afk Goodnight!"],
      },
      args: [
        {
          id: "reason",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a reason...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid reason...`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { reason }: { reason: string }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    if (reason.length > 1024) {
      embed.setColor(0xff0000);
      embed.setDescription(`The reason is over 1024 in length.`);
      return message.util.send(embed);
    }
    const afkModel = getModelForClass(AfkModel);
    const afk_model: AfkStatus = {
      isAfk: true,
      status: reason,
    };
    try {
      await afkModel.findOneAndUpdate(
        {
          userId: message.author.id,
        },
        {
          userId: message.author.id,
          $set: {
            afk: afk_model,
          },
        },
        { upsert: true }
      );
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription(`An error occurred: ${e.message}`);
      return message.util.send(embed);
    }
    embed.setDescription(`AFK Status set to: **${reason}**`);
    return message.channel.send(embed);
  }
}
