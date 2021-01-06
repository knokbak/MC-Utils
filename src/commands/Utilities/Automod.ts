import { getModelForClass } from "@typegoose/typegoose";
import { Command } from "discord-akairo";
import { MessageEmbed, Message } from "discord.js";
import AutoModModel, { AutoModSettings } from "../../models/AutoModModel";

export default class BotInfo extends Command {
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
                type: "string"
            },
            {
                id: "value",
                type: "string",
                match: "rest"
            }
        ]
      });
    }
  
    public async exec(message: Message, { key, value }: { key: string; value: string; }): Promise<Message> {
      const validOpts = ["mentionLimit", "messageLengthLimit", "nWordFilter", "filterURLs", "exemptRoles"];
      const embed = new MessageEmbed().setColor(0x1abc9c);
      if (!validOpts.includes(key)) {
          embed.setDescription(`Invalid argument for \`key\`. Available arguments:\n\`${validOpts.join(", ")}\``);
          embed.setColor(0xff0000);
          return message.util.send(embed);
      }
      const autoModModel = getModelForClass(AutoModModel);
      const defaultAutoModUpdate: AutoModSettings = {
        messageLengthLimit: 0,
        mentionLimit: 0,
        nWordFilter: null,
        filterURLs: null,
        soundPingFilter: null,
        exemptRoles: [""]
      }
      await autoModModel.findOneAndUpdate({
          guildId: message.guild.id,
      }, {
          guildId: message.guild.id,
          $set: {

          }
      })
    }
}