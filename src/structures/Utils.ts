import hook from "@picklerickdev/discord-webhooks";
import {
  TextChannel,
  Message,
  MessageEmbed,
  Guild,
  Client,
  GuildMember,
  Role,
  User,
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

export async function resolveUser(search: string, client: AkairoClient) {
  let user = null;
  if (!search || typeof search !== "string") return;
  if (search.match(/^<@!?(\d+)>$/)) {
    const id = search.match(/^<@!?(\d+)>$/)[1];
    user = client.users.cache.get(id);
    if (user) return user;
  }
  // Try username search
  if (search.match(/^!?(\w+)#(\d+)$/)) {
    user = client.users.cache.find((m) => m.tag === search);
    if (user) return user;
  }
  user = client.users.cache.get(search);
  return user;
}

/**
 * @deprecated
 * @description Mutes the user by taking all their roles. Meant for setTimeout
 */
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

/**
 * @deprecated
 * @description Meant to restore users roles after invoking muteUser()
 */
export async function restoreRoles(client, guildId: string, userId: string) {
  let guild = client.guilds.cache.get(guildId);
  let guildMember = guild.members.cache.get(userId);
  guildMember.roles.set(cachedUserRoles[userId]).catch(() => {});
}

export async function sendLogToChannel(
  client: AkairoClient,
  member: GuildMember,
  guildId: string
): Promise<Message> {
  const embed = new MessageEmbed().setColor(0x00ff0c);
  let userId = member.id;
  const sanctionsModel = getModelForClass(memberModel);
  const memberData = await sanctionsModel.findOne({
    userId: userId,
    guildId: guildId,
  });
  if (!memberData) {
    return;
  } else if (
    memberData.sanctions === null ??
    memberData.sanctions.length < 1 ??
    memberData.sanctions === undefined
  ) {
    return;
  } else {
    embed.setAuthor(
      `${member.user.tag}'s Modlogs`,
      member.user.displayAvatarURL({ dynamic: true })
    );
    embed.setDescription("All times are in UTC");
    const CASE_SUMMARY_REASON_MAX_LENGTH = 16;
    for (const s of memberData.sanctions) {
      if (s.reason.length > CASE_SUMMARY_REASON_MAX_LENGTH) {
        const match = s.reason
          .slice(CASE_SUMMARY_REASON_MAX_LENGTH, 100)
          .match(/(?:[.,!?\s]|$)/);
        const nextWhitespaceIndex = match
          ? CASE_SUMMARY_REASON_MAX_LENGTH + match.index!
          : CASE_SUMMARY_REASON_MAX_LENGTH;
        if (nextWhitespaceIndex < s.reason.length) {
          s.reason = s.reason.slice(0, nextWhitespaceIndex - 1) + "...";
        }
      }
      embed.addField(
        `${s.type}: \`${s.caseID}\``,
        `Moderator: **${s.moderator}**\nReason: **${s.reason}**\nDate: **${s.date}**`,
        true
      );
    }
    let c = member.guild.channels.cache.get(
      config.channels.botCmdChannel
    ) as TextChannel;
    return c.send(embed);
  }
}

export async function dmUserOnInfraction(
  user: User,
  dmMessage: MessageEmbed
): Promise<void> {
  await user.send(dmMessage).catch((e) => e);
}

// Thank you Zeppelin :D
export function asyncMap<T, R>(
  arr: T[],
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  return Promise.all(arr.map((item, index) => fn(item)));
}
