import { Command } from "discord-akairo";
import { MessageEmbed, GuildMember, Message } from "discord.js";

export default class CommandName extends Command {
  public constructor() {
    super("nickname", {
      aliases: ["nickname", "nick"],
      channel: "guild",
      category: "categoryName",
      userPermissions: ["MANAGE_NICKNAMES"], 
      clientPermissions: ["MANAGE_NICKNAMES"], 
      ratelimit: 3,
      description: {
        content: "Changes the nickname of a user",
        usage: "moderate [ID or Mention] (New Nickname)",
        examples: ["nickname 378025254125305867 menin", "nick @Menin#4642"],
      },
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid member...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member...`,
          },
        },
        {
            id: "nickname",
            type: "string",
            match: "rest",
            default: ""
        }
      ],
    });
  }

  public async exec(
    message: Message,
    { member, nickname }: { member: GuildMember; nickname: string}
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    if (!nickname) {
        try {
            await member.setNickname(member.user.username);
        } catch(e) {
            embed.setColor(0xff0000);
            embed.setDescription(`Couldn't set nickname because: **${e}**`);
            return message.util.send(embed);
        }
        
        embed.setDescription(`Reset nickname for **${message.author.tag}**`);
        return message.util.send(embed);
    } else {
        try {
            member.setNickname(nickname)
        } catch(e) {
            embed.setColor(0xff0000);
            embed.setDescription(`Couldn't set nickname because: **${e}**`);
            return message.util.send(embed);
        }
        
        embed.setDescription(`Set nickname for **${message.author.username}** -> **${nickname}**`);
        return message.util.send(embed);
    }
  }
}