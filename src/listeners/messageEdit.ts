import { Listener } from "discord-akairo";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class messageEdit extends Listener {
  public constructor() {
    super("messageUpdate", {
      emitter: "client",
      type: "on",
      event: "messageUpdate",
    });
  }

  public async exec(oldMessage: Message, newMessage: Message): Promise<void> {
    if (oldMessage.author.bot) {
      return;
    }
    let logChannel: TextChannel = this.client.guilds.cache
      .get("719977718858514483")
      .channels.cache.get(config.channels.logChannel) as TextChannel;
    let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        "Message Edited",
        newMessage.author.displayAvatarURL({ dynamic: true })
      )
      .setColor("RED")
      .setDescription(
        `**Old**\n\`\`\`${oldMessage.content}\`\`\`**New**\n\`\`\`${newMessage.content}\`\`\``
      )
      .addField("Author:", newMessage.author, true)
      .setFooter(`ID: ${newMessage.author.id} | ${dateString}`);

    return log(logChannel, embed, newMessage.guild.iconURL());
  }
}
