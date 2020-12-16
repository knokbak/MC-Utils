import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { utc } from "moment";
import { checkBanFromGuild } from "../../structures/Utils";

export default class Whois extends Command {
  public constructor() {
    super("whois", {
      aliases: ["whois", "userinfo"],
      channel: "guild",
      category: "Information",
      args: [
        {
          id: "member",
          type: "member",
          match: "rest",
          default: (msg: Message) => msg.member,
        },
      ],
      ratelimit: 3,
      description: {
        content: "Shows user information.",
        usage: "whois [mention or ID]",
        examples: ["whois @Axis#0001"],
      },
    });
  }

  public async exec(
    message: Message,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    const roles = member.roles.cache.map((r) => r).join(", ") || "None";
    const isBanned: boolean = await checkBanFromGuild(
      this.client,
      message.guild.id,
      member.id
    );
    let banned: string;
    if (isBanned) {
      banned = "<:Check:775723152521035776> User is Banned from this Guild";
    } else if (!isBanned) {
      banned = "<:Cross:775723152692346910> User is not Banned from this Guild";
    }
    return message.util.send(
      new MessageEmbed()
        .setAuthor(
          `User Info | ${member.user.tag}`,
          member.user.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor("BLUE")
        .setDescription(`<@${member.id}>`)
        .addField("Name", member.user.tag, true)
        .addField(
          "Created At",
          utc(member.user.createdAt).format("MMMM Do YYYY, h:mm:ss a") +
            " (UTC)",
          true
        )
        .addField(
          "Joined At",
          utc(member.guild.joinedAt).format("MMMM Do YYYY, h:mm:ss a") +
            " (UTC)",
          false
        )
        .addField("User ID", member.user.id, true)
        .addField("Roles", roles, false)
        .addField("Is Banned?", banned, false)
    );
  }
}
