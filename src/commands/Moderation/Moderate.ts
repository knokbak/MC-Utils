import { Command } from "discord-akairo";
import { GuildMember, Message, MessageEmbed } from "discord.js";

export default class CommandName extends Command {
  public constructor() {
    super("moderate", {
      aliases: ["moderate"],
      channel: "guild",
      category: "categoryName",
      userPermissions: ["MANAGE_NICKNAMES"], 
      clientPermissions: ["MANAGE_NICKNAMES"], 
      ratelimit: 3,
      description: {
        content: "Makes the nickname of a user mentionable",
        usage: "moderate [ID or Mention]",
        examples: ["moderate 378025254125305867", "moderate @Menin#4642"],
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
      ],
    });
  }

  public async exec(
    message: Message,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    function makeid(length: number) {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const embed = new MessageEmbed().setColor(0x00ff0c);

    let nick = makeid(6)
    let nickname = `Moderated Nickname ${nick}`;

    try {
      await member.setNickname(nickname, `Nickname Moderated by ${message.author.tag}`);
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription("Couldn't moderate nickname because of + **" + e + "**");
      return message.util.send(embed);
    }
    embed.setDescription(`Set **${member.user.username}**'s nickname to **${nickname}**`);
    return message.util.send(embed);
  }
}