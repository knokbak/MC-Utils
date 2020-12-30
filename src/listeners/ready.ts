import { Listener } from "discord-akairo";
import Logger from "../structures/Logger";
import MemberModel from "../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";
import { MessageEmbed } from "discord.js";
import { utc } from "moment"; 
import ms from "ms";
import Config from "../config";

export default class Ready extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
      category: "client",
    });
  }

  public async exec(): Promise<void> {
    let statusArray: string[] = [
      "Get out of my room, I'm playing Minecraft!",
      `e`,
      "On soundmc.world",
      "Breaking bedrock",
      "Mining bobux",
      "Speedrunning with Sound",
      "Eating cake",
      "Help me luca is keeping me in his basement",
      "jazzy is cool?",
      "piyeris is epic"
    ];

    setInterval(() => {
      const index = statusArray[Math.floor(Math.random() * statusArray.length)];
      this.client.user.setActivity(index, { type: "PLAYING" });
    }, 15000);

    Logger.success("READY", "Succesfully set bot activity.");

    setInterval(async () => {
      const muteDate = ms(Date.now())
      const muteModel = getModelForClass(MemberModel);
      await muteModel.find({ "mute.muted": true }).then((members) => {
        members.forEach((member) => {
          this.client.databaseCache_mutedUsers.set(`${member.id}-${member.guildId}`, member);
        });
      });
      this.client.databaseCache_mutedUsers.array().filter((m) => m.mute.endData <= muteDate).forEach(async (memberData) => {
        const guild = this.client.guilds.cache.get(memberData.guildId);
        if (!guild) return;
        memberData.mute = {
					muted: false,
					endDate: null,
					case: null
        };
        const muted = guild.roles.cache.get(Config.roles.muteRole);
        if (!muted) return;
        const roleImmutable = muted.members.filter((r) => r.id === memberData.id);
        if (roleImmutable) {
          roleImmutable.get(memberData.id).roles.remove(muted);
        }
        this.client.databaseCache_mutedUsers.delete(`${memberData.id}-${memberData.guildID}`);
        await memberData.save();
        console.log("[Mute] Mute removed!")
      })
    }, 1000);
    Logger.success("READY", `${this.client.user.tag} is now online!`);
  } 
} 