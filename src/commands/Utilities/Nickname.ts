import { Command } from "discord-akairo";
import { MessageEmbed, GuildMember, Message } from "discord.js";

export default class Nickname extends Command {
  public constructor() {
    super("nickname", {
      aliases: ["nickname", "nick"],
      channel: "guild",
      category: "Utilities",
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
      if (nickname.length > 32) {
        embed.setColor(0xff0000);
        embed.setDescription("Nickname is above 32 characters!");
        return message.util.send(embed);
      }
      try {
          await member.setNickname(member.user.username);
      } catch(e) {
          embed.setColor(0xff0000);
          embed.setDescription(`Couldn't set nickname because: **${e}**`);
          return message.util.send(embed);
      }
        
      embed.setDescription(`Reset nickname for **<@${member.user.id}>**`);
      return message.util.send(embed);
    } else {
      if (nickname.length > 32) {
        embed.setColor(0xff0000);
        embed.setDescription("Nickname is above 32 characters!");
        return message.util.send(embed);
      }
      try {
          member.setNickname(nickname)
      } catch(e) {
          embed.setColor(0xff0000);
          embed.setDescription(`Couldn't set nickname because: **${e}**`);
          return message.util.send(embed);
      }
        
      embed.setDescription(`Set nickname for **<@${member.user.id}>** -> **${nickname}**`);
      return message.util.send(embed);
    }
  }
}