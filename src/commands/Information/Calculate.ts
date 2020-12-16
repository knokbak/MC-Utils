import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { evaluate } from "mathjs";

export default class Calculate extends Command {
  public constructor() {
    super("calc", {
      aliases: ["calc", "calculate"],
      category: "Information",
      channel: "guild",
      description: {
        content: "Calculates a certain equation.",
        usage: "calc <equation || number>",
        examples: ["calc 2+2", "calc 3*2"],
      },
      ratelimit: 1,
      args: [
          {
              id: "eq",
              type: "string",
              match: "rest"
          }
      ]
    }); 
  } 


  public exec(message: Message, { eq }: { eq: string }): Promise<Message> {
    if(!eq) return message.util.send('Please input a calculation.')
    let resp;
    try {
        resp = evaluate(eq)
    } catch (e) {
        const errorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .addField('Input', `\`\`\`js\n${eq}\`\`\``)
        .addField('Output', `\`\`\`js\nSyntax Error\`\`\``)

        return message.util.send(errorEmbed)
    } 
    const answerEmbed = new MessageEmbed()
    .setColor('#09fff2')
    .addField('Input', `\`\`\`js\n${eq}\`\`\``)
    .addField('Output', `\`\`\`js\n${resp}\`\`\``)

    message.util.send(answerEmbed)
  }
}