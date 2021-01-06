import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class message extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      type: "on",
    });
  }

  public async exec(message: Message) {
    if (message.author.bot) return;
    await message.guild.members.fetch({ time: 20000 });
  }
}
