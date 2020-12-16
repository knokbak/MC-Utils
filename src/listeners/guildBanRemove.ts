import { Listener } from "discord-akairo";
import { Guild, MessageEmbed, TextChannel, User } from "discord.js";
import config from "../config";
import { utc } from "moment";
import { log } from "../structures/Utils";

export default class guildBanRemove extends Listener {
  public constructor() {
    super("guildBanRemove", {
      emitter: "client",
      event: "guildBanRemove",
      type: "on",
    });
  }

  public async exec(guild: Guild, user: User): Promise<void> {
    let logChannel: TextChannel = guild.channels.cache.get(
      config.channels.logChannel
    ) as TextChannel;
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        "User Un-Banned",
        user.displayAvatarURL({ dynamic: true })
      )
      .setColor("RED")
      .addField("User Mention:", `<@!${user.id}>`, true)
      .addField("Time Un-Banned:", dateString, true)
      .setFooter(`ID: ${user.id} | ${dateString}`);

    return log(logChannel, embed, guild.iconURL());
  }
}
