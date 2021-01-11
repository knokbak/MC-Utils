import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import AfkModel from "../models/AfkModel";
import AutoModModel from "../models/AutoModModel";
import {
  dispatchAfkEmbed,
  dispatchAutoModMsg,
  autoModWarn,
} from "../structures/Utils";
import urlRegexSafe from "url-regex-safe";

export default class message extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      type: "on",
    });
  }

  public async exec(message: Message) {
    await message.guild.members.fetch({ time: 20000 });
    const afkModel = getModelForClass(AfkModel);
    if (message.mentions.members.first()) {
      const current_afk = await afkModel.findOne({
        userId: message.mentions.members.first().id,
      });
      if (current_afk.afk.isAfk) {
        return await dispatchAfkEmbed(message, current_afk.afk.status);
      }
    }
    const autoModModel = getModelForClass(AutoModModel);
    const current_automod = await autoModModel.findOne({
      guildId: message.guild.id,
    });
    if (
      !current_automod.autoModSettings.exemptRoles.find((t) =>
        message.member.roles.cache.findKey((r) => r.id === t)
      )
    ) {
      if (message.content.match(urlRegexSafe({ strict: true }))) {
        await autoModWarn(
          message.member,
          message.guild,
          "Sending Links",
          message,
          this.client
        );
        await dispatchAutoModMsg("Sending Links", message, "Warned");
      }
    }
  }
}
