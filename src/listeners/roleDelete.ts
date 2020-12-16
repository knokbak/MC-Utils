import { Listener } from "discord-akairo";
import { Role, MessageEmbed, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class roleDelete extends Listener {
  public constructor() {
    super("roleDelete", {
      emitter: "client",
      type: "on",
      event: "roleDelete",
    });
  }

  public async exec(role: Role): Promise<void> {
    let logChannel: TextChannel = role.guild.channels.cache.get(
      config.channels.logChannel
    ) as TextChannel;
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        "Role Deleted",
        role.guild.iconURL({ dynamic: true })
      )
      .setColor("RED")
      .addField("Role Name:", role.name.toString(), true)
      .setFooter(`Guild ID: ${role.guild.id} | ${dateString}`);

    return log(logChannel, embed, role.guild.iconURL());
  }
}
