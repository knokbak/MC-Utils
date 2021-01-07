import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class Audit extends Command {
  public constructor() {
    super("audit", {
      aliases: ["audit"],
      channel: "guild",
      category: "Moderation",
      userPermissions: ["MANAGE_MESSAGES"],
      ratelimit: 3,
      description: {
        content: "Gives you back users that match a filter.",
        usage: "audit",
        examples: ["audit"],
      },
    });
  }

  public async exec(message: Message): Promise<Message> {
    const nWordRegExp = new RegExp("n[i1]gg?[e3]r[s\\$]?");
    const nWordRegExp2 = new RegExp("nniigg");
    const otherFilters = ['nigg', 'cunt', 'penis', 'dick', 'fuck'];

    let counter = 0;
    let badArr = [""];
    for (const user of message.guild.members.cache) {
        if (user[1].user.username.match(nWordRegExp) || user[1].user.username.match(nWordRegExp2) || otherFilters.includes(user[1].user.username)) {
            counter++;
            badArr.push(`${user[1].user.username} :: ${user[1].id}`);
        }
    }
    return message.util.send(`${counter} users matched filter:\n\`\`\`js\n${badArr.join("\n")}\n\`\`\``);
  }
}