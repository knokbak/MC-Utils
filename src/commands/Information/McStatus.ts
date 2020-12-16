import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";

export default class MCStatus extends Command {
  public constructor() {
    super("mcstatus", {
      aliases: ["mcstatus", "mcserver", "mc"],
      category: "Information",
      channel: "guild",
      description: {
        content: "Checks the status of the minecraft server!",
        usage: "mcstatus",
        examples: ["mc"],
      },
      ratelimit: 1,
    });
  }

  public async exec(message: Message): Promise<void> {
    const embed = new MessageEmbed();
    axios
      .get(`https://mc-api.net/v3/server/ping/play.soundmc.world`, {
        headers: {
          content_type: "application/json",
        },
      })
      .then(function (response) {
        if (response.data.online === true) {
          embed.setColor("GREEN");
          embed.addField("Server Online", "Yes", true);
        } else if (response.data.online === false) {
          embed.setColor("RED");
          embed.addField("Server Online", "No", true);
          return message.util.send(embed);
        }
        embed.addField(
          "Player Count",
          `${response.data.players.online} / ${response.data.players.max}`,
          false
        );
        embed.addField("Version", response.data.version.name, false);
        embed.setThumbnail(response.data.favicon);
        return message.channel.send(embed);
      })
      .catch((e) => {
        embed.setColor("RED");
        embed.setDescription(
          `An error occurred while fetching the server data:\n\`${e}\``
        );
        return message.channel.send(embed);
      });
  }
}
