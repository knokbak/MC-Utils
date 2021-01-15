import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class BanAll extends Command {
  public constructor() {
    super("luca", {
      aliases: ["luca"],
      category: "Fun",
      userPermissions: ["MANAGE_MESSAGES"],
      clientPermissions: ["MANAGE_MESSAGES"],
      channel: "guild",
      description: {
        content: "Tells my thoughts about Luca.",
        usage: "luca",
        examples: ["luca"],
      },
      ratelimit: 1,
    });
  }

  public async exec(message: Message) {
    await message.reply(
      `Lord Luca is pog, but make sure you don't mess with him or else he'll lock you up and torture you inside his basement. \nSo <:mcshut:788159015272185907>`
    );
  }
}
