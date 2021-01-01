import hook from "@picklerickdev/discord-webhooks";
import {
  TextChannel,
  Message,
  MessageEmbed,
  Guild,
  Client,
  GuildMember,
  Role,
  User
} from "discord.js";
import memberModel from "../models/MemberModel";
import config from "../config";
import { AkairoClient } from "discord-akairo";
import { getModelForClass } from "@typegoose/typegoose";

let cachedUserRoles = {};

export async function modLog(
  channel: TextChannel,
  message: Message | MessageEmbed,
  iconURL: any
) {
  hook(channel, message, {
    name: "SoundsMC Mod Logger",
    icon: iconURL,
  });
}

export async function log(
  channel: TextChannel,
  message: Message | MessageEmbed,
  iconURL: any
) {
  hook(channel, message, {
    name: "SoundsMC Logger",
    icon: iconURL,
  });
}

export async function request(
  channel: TextChannel,
  message: Message | MessageEmbed,
  iconURL: any
) {
  hook(channel, message, {
    name: "Feature Requests",
    icon: iconURL,
  });
}

export function findChannel(client: any, channel: string): TextChannel {
  let c: TextChannel = client.channels.cache.get(channel);
  return c;
}

export async function resolveMember(search: string, guild: Guild) {
  let member = null;
  if (!search || typeof search !== "string") return;
  // Try ID search
  if (search.match(/^<@!?(\d+)>$/)) {
    const id = search.match(/^<@!?(\d+)>$/)[1];
    member = await guild.members.fetch(id).catch(() => {});
    if (member) return member;
  }
  // Try username search
  if (search.match(/^!?(\w+)#(\d+)$/)) {
    guild = await guild.fetch();
    member = guild.members.cache.find((m) => m.user.tag === search);
    if (member) return member;
  }
  member = await guild.members.fetch(search).catch(() => {});
  return member;
}

export async function muteUser(
  client: Client,
  guildId: string,
  userId: string,
  roleId: Role
) {
  let guild = client.guilds.cache.get(guildId);
  let guildMember = guild.members.cache.get(userId);
  cachedUserRoles[userId] = guildMember.roles.cache;
  guildMember.roles
    .set([])
    .then((member) => {
      member.roles.add([roleId]);
    })
    .catch(() => {});
}

export async function restoreRoles(client, guildId: string, userId: string) {
  let guild = client.guilds.cache.get(guildId);
  let guildMember = guild.members.cache.get(userId);
  guildMember.roles.set(cachedUserRoles[userId]).catch(() => {});
}

export async function checkBanFromGuild(
  client: Client,
  guildId: string,
  userId: string
): Promise<boolean> {
  let guild = client.guilds.cache.get(guildId);
  let isBanned = await guild.fetchBans();
  if (isBanned.has(userId)) {
    return true;
  } else {
    return false;
  }
}

export async function sendLogToChannel(
  client: AkairoClient,
  member: GuildMember,
  guildId: string
): Promise<Message> {
  const embed = new MessageEmbed().setColor(0x00ff0c);
  let userId = member.id;
  const sanctionsModel = getModelForClass(memberModel);
  const memberData = await sanctionsModel.findOne(
    { id: userId, guildId: guildId }
  );
  if (memberData.sanctions.length < 1) {
    return;
  } else {
    embed.setAuthor(
      `${member.user.tag}'s Modlogs`,
      member.user.displayAvatarURL({ dynamic: true })
    );
    embed.setDescription("All times are in UTC");
    for (const s of memberData.sanctions) {
      embed.addField(
        s.type + " | #" + s.caseID,
        `Moderator: **${s.moderator}**\nReason: **${s.reason}**\nDate: **${s.date}**`,
        false
      );
    }
    let c = member.guild.channels.cache.get(
      config.channels.botCmdChannel
    ) as TextChannel;
    return c.send(embed);
  }
}

export async function dmUserOnInfraction(user: User, dmMessage: MessageEmbed): Promise<void> {
  await user.send(dmMessage)
    .catch((e) => e);
}
