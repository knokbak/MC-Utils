import { Listener } from "discord-akairo";
import Logger from "../structures/Logger";

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
      "jazzy is cool?"
    ];

    setInterval(() => {
      const index = statusArray[Math.floor(Math.random() * statusArray.length)];
      this.client.user.setActivity(index, { type: "PLAYING" });
    }, 15000);

    Logger.success("READY", "Succesfully set bot activity.");

    Logger.success("READY", `${this.client.user.tag} is now online!`);
  }
}
