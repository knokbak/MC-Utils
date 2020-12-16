import { Listener } from "discord-akairo";
import { MessageEmbed, GuildChannel, DMChannel, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class channelCreate extends Listener {
  public constructor() {
    super("channelCreate", {
      emitter: "client",
      event: "channelCreate",
      type: "on",
    });
  }

  public async exec(channel: DMChannel | GuildChannel): Promise<void> {
    if (channel.type === "dm") {
      return;
    } else {
      let logChannel: TextChannel = channel.guild.channels.cache.get(
        config.channels.logChannel
      ) as TextChannel;
      let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
      const embed = new MessageEmbed()
        .setAuthor("Channel Created", channel.guild.iconURL({ dynamic: true }))
        .setColor("BLUE")
        .addField("Channel Name:", `<#${channel.id}>`, true)
        .setFooter(`ID: ${channel.id} | ${dateString}`);
      return log(logChannel, embed, channel.guild.iconURL());
    }
  }
}
