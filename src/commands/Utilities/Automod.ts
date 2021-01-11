import { getModelForClass } from "@typegoose/typegoose";
import { Command } from "discord-akairo";
import { MessageEmbed, Message } from "discord.js";
import { strToBool } from "../../structures/Utils";
import AutoModModel, { AutoModSettings } from "../../models/AutoModModel";

export default class Automod extends Command {
  public constructor() {
    super("automod", {
      aliases: ["automod", "automod_settings"],
      channel: "guild",
      category: "Utilities",
      ratelimit: 3,
      description: {
        content: "Shows information about the bot.",
        usage: "botinfo",
        examples: ["botinfo"],
      },
      args: [
        {
          id: "key",
          type: "string",
        },
        {
          id: "value",
          type: "string",
          match: "rest",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { key, value }: { key: string; value: string }
  ): Promise<Message> {
    const validOpts = [
      "mentionLimit",
      "messageLengthLimit",
      "nWordFilter",
      "filterURLs",
      "exemptRoles",
      "soundPingFilter",
    ];
    const embed = new MessageEmbed().setColor(0x1abc9c);
    if (!validOpts.includes(key)) {
      embed.setDescription(
        `Invalid argument for \`key\`. Available arguments:\n\`${validOpts.join(
          ", "
        )}\``
      );
      embed.setColor(0xff0000);
      return message.util.send(embed);
    }
    const autoModModel = getModelForClass(AutoModModel);
    let defaultAutoModUpdate: AutoModSettings = {
      messageLengthLimit: null,
      mentionLimit: null,
      nWordFilter: null,
      filterURLs: null,
      soundPingFilter: null,
      exemptRoles: [""],
    };
    // Iterate through the key's and see if they match one val
    if (key === "mentionLimit") {
      if (isNaN(parseInt(value))) {
        embed.setDescription(
          `Invalid argument for \`value\`. Available values:\n\`integer\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: null,
        mentionLimit: parseInt(value),
        nWordFilter: null,
        filterURLs: null,
        soundPingFilter: null,
        exemptRoles: [""],
      };
    } else if (key === "messageLengthLimit") {
      if (isNaN(parseInt(value))) {
        embed.setDescription(
          `Invalid argument for \`value\`. Available values:\n\`integer\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: parseInt(value),
        mentionLimit: null,
        nWordFilter: null,
        filterURLs: null,
        soundPingFilter: null,
        exemptRoles: [""],
      };
    } else if (key === "nWordFilter") {
      if (value !== "true" ?? value !== "false") {
        embed.setDescription(
          `Invalid argument for \`value\`. Available values:\n\`true, false\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: null,
        mentionLimit: null,
        nWordFilter: strToBool(value) ?? false,
        filterURLs: null,
        soundPingFilter: null,
        exemptRoles: [""],
      };
    } else if (key === "filterURLs") {
      if (value !== "true" ?? value !== "false") {
        embed.setDescription(
          `Invalid argument for \`value\`. Available values:\n\`true, false\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: null,
        mentionLimit: null,
        nWordFilter: null,
        filterURLs: strToBool(value) ?? false,
        soundPingFilter: null,
        exemptRoles: [""],
      };
    } else if (key === "exemptRoles") {
      if (!value.split(" ")) {
        embed.setDescription(
          `Invalid argument for \`value\`. Available values:\n\`string:Snowflake\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: null,
        mentionLimit: null,
        nWordFilter: null,
        filterURLs: null,
        soundPingFilter: null,
        exemptRoles: value.split(" "),
      };
    } else if (key === "soundPingFilter") {
      if (value !== "true" ?? value !== "false") {
        embed.setDescription(
          `Invalid argument for \`value\`. Available arguments:\n\`true, false\``
        );
        embed.setColor(0xff0000);
        return message.util.send(embed);
      }
      defaultAutoModUpdate = {
        messageLengthLimit: null,
        mentionLimit: null,
        nWordFilter: null,
        filterURLs: null,
        soundPingFilter: strToBool(value) ?? false,
        exemptRoles: [""],
      };
    }
    try {
      await autoModModel.findOneAndUpdate(
        {
          guildId: message.guild.id,
        },
        {
          guildId: message.guild.id,
          $set: {
            autoModSettings: defaultAutoModUpdate,
          },
        },
        { upsert: true }
      );
    } catch (e) {
      embed.setDescription(`Couldn't set automod settings:\n\`${e}\``);
      embed.setColor(0xff0000);
      return message.util.send(embed);
    }
    embed.setDescription(`Successfully set **${key}** to **${value}**.`);
    return message.channel.send(embed);
  }
}
