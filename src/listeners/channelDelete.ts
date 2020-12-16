import { Listener } from "discord-akairo";
import { MessageEmbed, GuildChannel, DMChannel, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class channelDelete extends Listener {
  public constructor() {
    super("channelDelete", {
      emitter: "client",
      event: "channelDelete",
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
        .setAuthor("Channel Deleted", channel.guild.iconURL({ dynamic: true }))
        .setColor("RED")
        .addField("Channel ID:", `${channel.id}`, true)
        .setFooter(`ID: ${channel.id} | ${dateString}`);
      return log(logChannel, embed, channel.guild.iconURL());
    }
  }
}
