import { Command } from "discord-akairo";
import { Message, TextChannel, MessageEmbed } from "discord.js";

export default class Say extends Command {
  public constructor() {
    super("rule", {
      aliases: ["rule"],
      channel: "guild",
      category: "Utilities",
      userPermissions: ["MANAGE_MESSAGES"],
      ratelimit: 3,
      description: {
        content: "Display provided rule.",
        usage: "rule [number]",
        examples: ["rule 1", "rule 4"],
      },
      args: [
        {
          id: "ruleNum",
          type: "string",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { ruleNum }: { ruleNum: string }
  ): Promise<Message> {
    const rules = [
        "",
        "Do not use any racial slurs, or be racist in any way.",
        "No voice changers in VC, and do not earrape.",
        "Do not impersonate anybody famous, or anybody on the server, unless they consent to it.",
        "Do not spam, in any chat.",
        "Toxicity is not permitted.",
        "Keep it SFW, so no Gore or NSFW. (duh)",
        "You are allowed to swear, but please keep in mind that you can't be toxic.",
        "No advertising, in any chats or DMs.",
        "Please speak English only."
    ]
    const ruleN = parseInt(ruleNum)
    if(isNaN(ruleN) || ruleN > rules.length || ruleN < 1)return message.reply(`No such rule exists?`)
    let rule = rules[ruleNum]
    //if(rules.length < ruleNum-1)return message.reply(`e`)
    const embed = new MessageEmbed()
        .setAuthor(`Sound's MC World's Rules`)
        .setDescription(rule)
        .setFooter(`Rule #${ruleNum}`)
    return message.channel.send(embed)
  }
}
