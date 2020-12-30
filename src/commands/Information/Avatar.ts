import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed, ImageSize } from "discord.js";

export default class Avatar extends Command {
  public constructor() {
    super("avatar", {
      aliases: ["avatar", "av"],
      category: "Information",
      channel: "guild",
      description: {
        content: "Display's the avatar of a member.",
        usage: "avatar [ID or Mention] <-size {number}>",
        examples: [
          "avatar",
          "avatar @Axis#0001",
          "avatar @Axis#0001 -size 512",
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: "member",
          type: "member" ?? "memberMention" ?? "user",
          match: "rest",
          default: (msg: Message) => msg.member,
        },
        {
          id: "size",
          type: (_: Message, str: string): null | Number => {
            if (
              str &&
              !isNaN(Number(str)) &&
              [16, 32, 64, 128, 256, 512, 1024, 2048].includes(Number(str))
            )
              return Number(str);
          },
          match: "option",
          flag: ["-size "],
          default: 128,
        },
      ],
    });
  }

  public exec(
    message: Message,
    { member, size }: { member: GuildMember; size: number }
  ): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setTitle(`Avatar | ${member.user.tag}`)
        .setColor("#00FF0C")
        .setImage(
          member.user.displayAvatarURL({
            size: size as ImageSize,
            dynamic: true,
          })
        )
    );
  }
}
