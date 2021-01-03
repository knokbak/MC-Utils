import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";
import { dmUserOnInfraction } from "../../structures/Utils";
import uniqid from "uniqid";
import Config from "../../config";

export default class Bug extends Command {
  public constructor() {
    super("bug", {
      aliases: ["bug", "error"],
      channel: "guild",
      category: "Utilities",
      ratelimit: 3,
      description: {
        content: "Generates a bug report.",
        usage: "bug [commandName] [description]",
        examples: [
          "bug ban Does not actually ban the member!",
          "bug warn Please make this more stable!",
        ],
      },
      args: [
        {
          id: "title",
          type: "commandAlias",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a command for the bug report....`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid command for the bug report...`,
          },
        },
        {
          id: "description",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a description for the bug report....`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid description for the bug report...`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { title, description }: { title: string; description: string }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    if (description.length > 1024) {
      embed.setColor(0xff0000);
      embed.setDescription(
        "The length of your message is above `1024` characters!"
      );
      return message.util.send(embed);
    }
    const axisAsUser = this.client.users.cache.get(Config.bot.axis);
    if (!axisAsUser) {
      embed.setColor(0xff0000);
      embed.setDescription(
        "Internal error with this command, report to <@!100690330336129024>."
      );
      return message.util.send(embed);
    }
    const reportId = uniqid();
    const reqEmbed = new MessageEmbed()
      .setTitle(`Bug Report from - ${message.author.tag}`)
      .addField("Report ID", reportId, true)
      .addField("Reported Cmd", title, true)
      .addField("Report Description", description, false)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor(0xff0000)
      .setFooter(`Reporter ID: ${message.author.id}`);
    try {
      await dmUserOnInfraction(axisAsUser, reqEmbed);
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription(`Couldn't send DM because of: **${e}**`);
      return message.util.send(embed);
    }
    embed.setDescription(`Bug reported! Your Report ID is: \`${reportId}\``);
    return message.channel.send(embed);
  }
}
