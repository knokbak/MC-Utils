import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { dmUserOnInfraction, findChannel, modLog, sendLogToChannel } from "../../structures/Utils";
import config from "../../config";
import { utc } from "moment";
import Logger from "../../structures/Logger";
import memberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Warn extends Command {
    public constructor() {
        super("dm", {
            aliases: ["dm"],
            category: "Moderation",
            channel: "guild",
            description: {
                content: "Updates a user DM advertising infractions",
                usage: "dm [ID or Mention]",
                examples: ["dm @Axis#0001", "dm 20304092002934"],
            },
            ratelimit: 3,
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                    id: "member",
                    type: "member" ?? "memberMention",
                    prompt: {
                        start: (msg: Message) =>
                            `${msg.author}, please provide a member to DM warn...`,
                        retry: (msg: Message) =>
                            `${msg.author}, please provide a valid member to DM warn...`,
                    },
                },
                 
            ],
        });
    }

    public async exec(
        message: Message,
        { member, reason }: { member: GuildMember; reason: string }
    ): Promise<Message> {
        const embed = new MessageEmbed().setColor(0x00ff0c);
        if (member.id === message.author.id) {
          embed.setDescription("You cannot dm warn yourself!");
          return message.util.send(embed);
        }
        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if (
            message.member.guild.ownerID !== message.author.id &&
            !(moderationPosition >= memberPosition)
        ) {
            embed.setDescription(
                `You cannot DM warn a member with a role superior (or equal) to yours!`
            );
            await message.util.send(embed);
            return;
        }

        const sanctionsModel = getModelForClass(memberModel); 
        const alreadyDMwarnedCheck = await sanctionsModel.findOne({
            guildID: message.guild.id, 
            userID: member.id, 
            caseInfo: { reason: "DM advertising (1st)".toLowerCase() }
        });
        if (alreadyDMwarnedCheck.sanctions.filter((r) => r.reason === "DM advertising (1st)")) { 
            if (!member.bannable) {
            embed.setDescription(
                "User has reached DM 2:\n\nYou cannot ban this user as they are considered not bannable."
            );
            return message.util.send(embed);
            }
            if (
            member.hasPermission("ADMINISTRATOR") ||
            member.hasPermission("MANAGE_GUILD")
            ) {
            embed.setDescription(
                `User has reached DM 2:\n\nYou cannot ban this user as they have the \`ADMINISTRATOR\` or \`MANAGE_GUILD\` permission.`
            );
            return message.util.send(embed);
            }
            if (member.id === message.guild.ownerID) {
            embed.setDescription(
                `User has reached DM 2:\n\nYou cannot ban this person as the person is the guild owner.`
            );
            return message.util.send(embed);
            }
            let caseNum = Math.random().toString(16).substr(2, 8);
            let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
            let userId = member.id;
            let guildID = message.guild.id;
            const caseInfo = {
                caseID: caseNum,
                moderator: message.author.tag,
                user: `${member.user.tag} (${userId})`,
                date: dateString,
                type: "Ban",
                reason: "DM advertising (2nd)"
            }
            const embedToSend = new MessageEmbed()
                .setColor('#FF000')
                .setDescription(`You have been banned from **${message.guild.name}** for continuation of DM advertising. If you believe this ban is unjustified, you can appeal [here](https://support.sounddrout.com/)`)
                .setAuthor(`You have been banned from ${message.guild.name}!`, this.client.user.displayAvatarURL())
            try {
                await sanctionsModel.findOneAndUpdate(
                    {
                        guildId: guildID,
                        id: userId
                    },
                    {
                        guildId: guildID,
                        id: userId,
                        $push: {
                            sanctions: caseInfo
                        }
                    },
                    {
                        upsert: true
                    }
                ).catch((e) => message.channel.send(`Error Logging Warn to DB: ${e}`));
            } catch (e) {
                Logger.error("DB", e);
            }
            try {
                await dmUserOnInfraction(
                    member.user,
                    embedToSend
                );
            } catch (e) {
                embed.setDescription(
                    "User has reached DM 2:\n\nCouldn't send them a ban message! Continuing..."
                );
            }
            await member.ban({ reason: "DM advertising (2nd)" });
            const logEmbed = new MessageEmbed()
                .setTitle(`Member Banned | Case \`${caseNum}\` | ${member.user.tag}`)
                .addField(`User:`, `<@${member.id}>`, true)
                .addField(`Moderator:`, `<@${message.author.id}>`, true)
                .addField(`Reason:`, "DM advertising (2nd)", true)
                .setFooter(`ID: ${member.id} | ${dateString}`)
                .setColor("RED");
            let modlogChannel = findChannel(
                this.client,
                config.channels.modLogChannel
            );
            modLog(modlogChannel, logEmbed, message.guild.iconURL());
            embed.setDescription(`Banned **${member.user.tag}** (DM Ad 2) | \`${caseNum}\``);
            return message.channel.send(embed);
        }; 

        let caseNum = Math.random().toString(16).substr(2, 8);
        let dateString: string = utc().format("MMMM Do YYYY, h:mm:ss a");
        let userId = member.id;
        let guildID = message.guild.id;
        
        const caseInfo = {
            caseID: caseNum,
            channel: message.channel.id,
            moderator: message.author.tag,
            user: `${member.user.tag} (${member.user.id})`,
            date: dateString,
            type: "Warn",
            reason: "DM advertising (1st)",
        };

        try {
            await sanctionsModel.findOneAndUpdate(
                {
                    guildId: guildID,
                    id: userId
                },
                {
                    guildId: guildID,
                    id: userId,
                    $push: {
                        sanctions: caseInfo
                    }
                },
                {
                    upsert: true
                }
            ).catch((e) => message.channel.send(`Error Logging Warn to DB: ${e}`));
        } catch (e) {
            Logger.error("DB", e);
        }

        embed.setDescription(`Warned **${member.user.tag}** | \`${caseNum}\``);

        await sendLogToChannel(this.client, member, message.guild.id);

        const logEmbed = new MessageEmbed()
            .setTitle(`Member Warned | Case \`${caseNum}\` | ${member.user.tag}`)
            .addField(`User:`, `<@${member.id}>`, true)
            .addField(`Moderator:`, `<@${message.author.id}>`, true)
            .addField(`Reason:`, "DM advertising (1st)", true)
            .setFooter(`ID: ${member.id} | ${dateString}`)
            .setColor("ORANGE");

        let modlogChannel = findChannel(this.client, config.channels.modLogChannel);
        await modLog(modlogChannel, logEmbed, message.guild.iconURL());
        return message.util.send(embed);

        embed.setDescription(`Warned **${member.user.tag}** (DM Ad 1) | \`${caseNum}\``);
        return message.channel.send(embed);
    }
}
