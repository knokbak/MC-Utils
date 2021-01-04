import { Listener } from "discord-akairo";
import { MessageEmbed, Message, TextChannel } from "discord.js";
import { utc } from "moment";
import config from "../config";
import { log } from "../structures/Utils";

export default class message extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      type: "on",
    });
  }

  public async exec(message: Message): Promise<void> {
    await message.guild.members.fetch();
    console.log("member fetched!");
  }
}
