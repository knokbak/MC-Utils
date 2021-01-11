import { Command } from "discord-akairo";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import { makeid } from "../../structures/Utils";

export default class Moderate extends Command {
  public constructor() {
    super("moderate", {
      aliases: ["moderate"],
      channel: "guild",
      category: "Moderation",
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
    const embed = new MessageEmbed().setColor(0x00ff0c);

    let nick = makeid(6);
    let nickname = `Moderated Nickname ${nick}`;

    try {
      await member.setNickname(
        nickname,
        `Nickname Moderated by ${message.author.tag}`
      );
    } catch (e) {
      embed.setColor(0xff0000);
      embed.setDescription(
        "Couldn't moderate nickname because of + **" + e + "**"
      );
      return message.util.send(embed);
    }
    embed.setDescription(
      `Set **${member.user.username}**'s nickname to **${nickname}**`
    );
    return message.util.send(embed);
  }
}
