import { Listener } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class messageDelete extends Listener {
  public constructor() {
    super("messageDelete", {
      emitter: "client",
      type: "on",
      event: "messageDelete",
    });
  }

  public async exec(message: Message): Promise<void> {
    if (message.author.bot) {
      return;
    }
    let logChannel: TextChannel = message.guild.channels.cache.get(
      config.channels.logChannel
    ) as TextChannel;
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        "Message Deleted",
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setColor("RED")
      .addField(
        "Message Content:",
        `\`\`\`${message.content.toString()}\`\`\``,
        false
      )
      .addField("Author:", message.author, false)
      .addField("Channel", message.channel, true)
      .setFooter(`ID: ${message.author.id} | ${dateString}`);

    return log(logChannel, embed, message.guild.iconURL());
  }
}
