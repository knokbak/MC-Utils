// import { Listener } from "discord-akairo";
// import { Message } from "discord.js";

// export default class message extends Listener {
//   public constructor() {
//     super("message", {
//       emitter: "client",
//       event: "message",
//       type: "on",
//     });
//   }

//   public async exec(message: Message): Promise<Message> {
//     if (message.content.startsWith(`${this.client.user}`))
//       return message.channel.send(
//         `Hello! My prefix is \`<\`. For a list of commands, run \`<help\``
//       );
//   }
// }
