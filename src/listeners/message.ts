import { getModelForClass } from "@typegoose/typegoose";
import { Listener } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import AfkModel from "../models/AfkModel";
import { dispatchAfkEmbed } from "../structures/Utils";

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
    const current_afk = await afkModel.findOne({ userId: message.author.id });
    if (current_afk.afk.isAfk) {
      return await dispatchAfkEmbed(message, current_afk.afk.status);
    }
  } 
}
