import { Listener } from "discord-akairo";
import {
  Snowflake,
  Message,
  Collection,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class messageDeleteBulk extends Listener {
  public constructor() {
    super("messageDeleteBulk", {
      emitter: "client",
      type: "on",
      event: "messageDeleteBulk",
    });
  }

  public async exec(messages: Collection<Snowflake, Message>): Promise<void> {
    let logChannel: TextChannel = this.client.channels.cache.get(
      config.channels.logChannel
    ) as TextChannel;
    let img: string = logChannel.guild.iconURL({ dynamic: true });
    let imgStill: string = logChannel.guild.iconURL();
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Message Bulk Deleted", img)
      .setColor("RED")
      .addField("Message Amount:", messages.size, true)
      .setFooter(`${dateString}`);

    return log(logChannel, embed, imgStill);
  }
}
