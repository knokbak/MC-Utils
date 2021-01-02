import { Command } from "discord-akairo";
import { modLog, findChannel } from "../../structures/Utils";
import ms from "ms";
import { utc } from "moment";
import config from "../../config";
import memberModel, { CaseInfo } from "../../models/MemberModel";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import Logger from "../../structures/Logger";
import { getModelForClass } from "@typegoose/typegoose";
import uniqid from "uniqid";

export default class Mute extends Command {
  public constructor() {
    super("mute", {
      aliases: ["mute"],
      channel: "guild",
      category: "Moderation",
      userPermissions: ["MANAGE_MESSAGES"],
      ratelimit: 3,
      description: {
        content: "Mute a member in the server.",
        usage: "mute [ID or Mention] [time h/m/d] <reason>",
        examples: ["mute @Axis#0001 10m rule breaking!"],
      },
      args: [
        {
          id: "member",
          type: "member" ?? "memberMention",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a member to mute...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member to mute...`,
          },
        },
        {
          id: "time",
          type: "string",
          prompt: {
            start: (msg: Message) => `${msg.author}, please provide a time...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid time...`,
          },
        },
        {
          id: "reason",
          type: "string",
          match: "rest",
          default: "No reason provided.",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    {
      member,
      time,
      reason,
    }: { member: GuildMember; time: string; reason: string }
  ): Promise<Message> {
    const embed = new MessageEmbed().setColor(0x1abc9c);

    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;

    if (message.author.id === member.id) {
      embed.setDescription("You cannot mute yourself!");
      return message.util.send(embed);
    }

    if (
      message.member.guild.ownerID !== message.author.id &&
      !(moderationPosition >= memberPosition)
    ) {
      embed.setDescription(
        `You cannot mute a member with a role superior (or equal) to yours!`
      );
      return message.util.send(embed);
    }

    const user = await message.guild.members.fetch(member.id).catch(() => {});

    if (!user) {
      embed.setDescription("This user does not exist. Please try again.");
      message.util.send(embed);
      return;
    }

    if (!time || isNaN(ms(time))) {
      embed.setDescription(
        "You must enter a valid time! Valid units: `s`, `m`, `h` or `d`"
      );
      return message.util.send(embed);
    }

    if (
      user.hasPermission("ADMINISTRATOR") ||
      user.hasPermission("MANAGE_GUILD")
    ) {
      embed.setDescription(
        "I cannot mute this user as they have the permission `ADMINISTRATOR` or `MANAGE_GUILD`"
      );
      return message.util.send(embed);
    }

    let muteRole = message.guild.roles.cache.get("726601422438924309");

    if (!muteRole) {
      embed.setDescription(
        "There is no `Muted` role setup. Contact one of the devs to fix!"
      );
      return message.util.send(embed);
    }

    await user.roles.add(muteRole);

    let caseNum = uniqid();

    member.send(
      `Hello ${user.user.tag},\nYou have just been muted in **${message.guild.name}** for **${time}** for **${reason}**!`
    );
    embed.setDescription(`Muted **${user.user.tag}** | \`${caseNum}\``);
    message.channel.send(embed);

    let userId = member.id;
    let guildID = message.guild.id;

    const caseInfo: CaseInfo = {
      caseID: caseNum,
      moderator: message.author.tag,
      moderatorId: message.author.id,
      user: `${member.user.tag} (${member.user.id})`,
      date: utc().format("MMMM Do YYYY, h:mm:ss a"),
      type: "Mute",
      reason,
      time,
    };

    const muteInformation = {
      muted: true,
      endDate: ms(time),
      case: caseNum,
    };

    const sanctionsModel = getModelForClass(memberModel);
    try {
      var isMuted = await sanctionsModel.findOne({
        guildId: guildID,
        id: userId,
      });
      if (!isMuted) {
        embed.setDescription(`No modlogs found for that user`);
        return message.util.send(embed);
      } else if (
        isMuted.sanctions === null ??
        isMuted.sanctions.length < 1 ??
        isMuted.sanctions === undefined
      ) {
        embed.setDescription(`No modlogs found for that user`);
        return message.util.send(embed);
      }
    } catch (e) {}

    try {
      await sanctionsModel
        .findOneAndUpdate(
          {
            guildId: guildID,
            userId: userId,
          },
          {
            guildId: guildID,
            userId: userId,
            $push: {
              sanctions: caseInfo,
            },
            $set: {
              mute: muteInformation,
            },
          },
          {
            upsert: true,
          }
        )
        .catch((e) => message.channel.send(`Error Logging Mute to DB: ${e}`));
    } catch (e) {
      Logger.error("DB", e);
    }

    const logEmbed = new MessageEmbed()
      .setTitle(`Member Muted | Case \`${caseNum}\` | ${member.user.tag}`)
      .addField(`User:`, `<@${member.id}>`, true)
      .addField(`Moderator:`, `<@${message.author.id}>`, true)
      .addField(`Time:`, time, true)
      .addField(`Reason:`, reason, true)
      .setFooter(
        `ID: ${member.id} | ${utc().format("MMMM Do YYYY, h:mm:ss a")}`
      )
      .setColor("RED");

    let modlogChannel = findChannel(this.client, config.channels.modLogChannel);
    modLog(modlogChannel, logEmbed, message.guild.iconURL());

    // setTimeout(async () => {
    //   await user.roles.remove(muteRole);
    //   const logEmbedUnmute = new MessageEmbed()
    //   .setTitle(`Member Unmuted | ${member.user.tag}`)
    //   .addField(`User:`, `<@${member.id}>`, true)
    //   .addField(`Moderator:`, `<@${message.author.id}>`, true)
    //   .setFooter(
    //     `ID: ${member.id} | ${utc().format("MMMM Do YYYY, h:mm:ss a")}`
    //   )
    //   .setColor("RED");

    // let modlogChannel = findChannel(this.client, config.channels.modLogChannel);
    // modLog(modlogChannel, logEmbedUnmute, message.guild.iconURL());
    // }, ms(time));
  }
}
