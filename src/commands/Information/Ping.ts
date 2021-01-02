import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class Ping extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "Information",
      channel: "guild",
      description: {
        content: "Checks the latency of the bot.",
        usage: "ping",
        examples: ["ping"],
      },
      ratelimit: 1,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const msg = await message.channel.send("Pinging...");
    const ping = msg.createdTimestamp - message.createdTimestamp;
    await msg.delete();
    const embed = new MessageEmbed()
      .setTitle("Ping Information")
      .setColor("GREEN")
      .addField("Discord Latency", this.client.ws.ping + "ms")
      .addField("Message Latency", ping + "ms");
    return message.util.send(embed);
  }
}
