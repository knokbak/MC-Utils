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
    await message.guild.members.fetch();
    if (message.content.startsWith(`<@!${this.client.user.id}>`)) {
        message.reply(`Hey! My prefix is \`${this.client.commandHandler.prefix}\`!`);
    }
  }
}
