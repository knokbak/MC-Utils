import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class Ping extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "Information",
      channel: "guild",
      description: {
        content: "Check the latency of the bot.",
        usage: "ping",
        examples: ["ping"],
      },
      ratelimit: 1,
    });
  }

  public exec(message: Message): Promise<Message> {
    return message.util.send(`\`${this.client.ws.ping}ms\``);
  }
}
