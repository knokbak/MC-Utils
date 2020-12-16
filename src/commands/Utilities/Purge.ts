import { Command } from "discord-akairo";
import { Message, TextChannel } from "discord.js";

export default class Purge extends Command {
  public constructor() {
    super("purge", {
      aliases: ["purge", "clear"],
      channel: "guild",
      category: "Utilities",
      userPermissions: ["MANAGE_MESSAGES"],
      ratelimit: 3,
      description: {
        content: "Purges a certain number of messages.",
        usage: "purge [number]",
        examples: ["purge 5"],
      },
      args: [
        {
          id: "number",
          type: "number",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a number of messages....`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid number of messages...`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { number }: { number: number }
  ): Promise<void> {
    let txt = message.channel as TextChannel;
    await txt.bulkDelete(number).then(async () => {
      let msg = await message.channel.send(
        `:tools: Deleted \`${number}\` messages from this channel.`
      );
      await msg.delete({ timeout: 5000 });

    });
  }
}
