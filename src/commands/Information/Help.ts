import { Command } from "discord-akairo";
import {
  MessageEmbed,
  Message,
  BitFieldResolvable,
  PermissionString,
} from "discord.js";
import { stripIndents } from "common-tags";

export default class Help extends Command {
  public constructor() {
    super("help", {
      aliases: ["help", "cmds"],
      channel: "guild",
      category: "Information",
      description: {
        content: "Shows command list.",
        usage: "help <command>",
        examples: ["help ping"],
      },
      ratelimit: 3,
      args: [
        {
          id: "command",
          type: "commandAlias",
          default: null,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { command }: { command: Command }
  ): Promise<Message> {
    const embed = new MessageEmbed();
    if (command) {
      embed
        .setAuthor(`Help | ${command}`, this.client.user.displayAvatarURL())
        .setDescription(
          stripIndents`
                **Description:**
                ${command.description.content || "No Content Provided."}

                **Usage:**
                ${command.description.usage || "No Usage Provided."}

                **Available Aliases:**
                ${command.aliases.join(", ")}

                **Examples:**
                ${
                  command.description.examples
                    ? command.description.examples
                        .map((e) => `\`${e}\``)
                        .join("\n")
                    : "No Examples Provided"
                }
            `
        )
        .setColor(0x00ff0c);
      return message.channel.send(embed);
    }

    const em1 = new MessageEmbed()
      .setAuthor(
        `Help | ${this.client.user.username}`,
        this.client.user.displayAvatarURL()
      )
      .setFooter(
        `${this.client.commandHandler.prefix}help [command] for more information on a command.`
      );

    for (const category of this.handler.categories.values()) {
      if (["default"].includes(category.id)) continue;

      em1.addField(
        `${category.id}`,
        category
          .filter(
            (cmd) =>
              cmd.aliases.length > 0 &&
              message.member.permissions.has(
                cmd.userPermissions as BitFieldResolvable<PermissionString>
              )
          )
          .map((cmd) => `**\`${cmd}\`**`)
          .join(", ") || "No commands in this category!"
      );
      em1.setColor(0x00ff0c);
    }
    return message.channel.send(em1);
  }
}
