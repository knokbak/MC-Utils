import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import memberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class DelWarn extends Command {
    public constructor() {
      super("delwarn", {
        aliases: ["delwarn", "rmpunish"],
        category: "Moderation",
        channel: "guild",
        description: {
          content: "Remove a warning from a user.",
          usage: "delwarn [ID]",
          examples: ["delwarn 293003", "ban 203940220939"],
        },
        ratelimit: 3,
        userPermissions: ["MANAGE_MESSAGES"],
        args: [
          {
            id: "id",
            type: "string",
            prompt: {
              start: (msg: Message) =>
                `${msg.author}, please provide a valid case ID to delete...`,
              retry: (msg: Message) =>
                `${msg.author}, please provide a valid case ID to delete...`,
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

    public async exec(message: Message, { id, reason }: { id: string, reason: string }): Promise<void | Message> {
      const role = message.guild.roles.cache.get("720411099148845137");
      /*if(message.member.roles.highest.position < role.position) {
        return;
      }*/
      const caseID = id;
      const sanctionsModel = getModelForClass(memberModel);
      try {
        const pendingDeletion = await sanctionsModel.findOne({
          guildId: message.guild.id,
          "sanctions.caseID": caseID
        });
        if (!pendingDeletion.sanctions.filter(n => n.caseID === caseID)) {
          return message.util.send("Couldn't find warn ID " + caseID);
        }
      } catch (e) {
        return message.util.send("Couldn't find warn ID " + caseID);
      }
      await sanctionsModel.findOneAndDelete({
        guildId: message.guild.id,
        "sanctions.caseID": caseID
      })
      .catch(() => {
        const errorEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setAuthor('Error')
        .setDescription('This case ID was not found!')
        return message.util.send(errorEmbed);
      })
      await message.util.send(`Case ID ${caseID} has been deleted.`);
    }
}
