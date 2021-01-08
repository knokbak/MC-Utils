import { Command } from "discord-akairo";
import { Message } from "discord.js";
// Replace everything prefixed with commandName or commandUsage with an actual value, duh :D
export default class CommandName extends Command {
  public constructor() {
    super("sans", {
      aliases: ["sans"],
      channel: "guild",
      category: "Fun",
      // userPermissions: ["MANAGE_CHANNELS"], ONLY USE IF CMD REQ PERM
      // clientPermissions: [""], SAME THING AS ABOVE
      ratelimit: 2, // Usually keep this
      description: { // All of this below for the help command
        content: "SANS.",
        usage: "sans",
        examples: ["sans"],
      },
    });
  }

  public async exec(message: Message) {
    await message.reply(`Sans. \n~spainel#3030`);
    }
}