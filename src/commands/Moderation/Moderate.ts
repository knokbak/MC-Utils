import { Command } from "discord-akairo";
import { GuildMember } from "discord.js";
import { Message } from "discord.js";
// Replace everything prefixed with commandName or commandUsage with an actual value, duh :D
export default class CommandName extends Command {
  public constructor() {
    super("moderate", {
      aliases: ["moderate"],
      channel: "guild",
      category: "categoryName",
      userPermissions: ["MANAGE_NICKNAMES"], 
      clientPermissions: ["MANAGE_NICKNAMES"], 
      ratelimit: 3, // Usually keep this
      description: { // All of this below for the help command
        content: "Makes the nickname of a user mentionable",
        usage: "moderate [ID or Mention]",
        examples: ["moderate 378025254125305867", "moderate @Menin#4642"],
      },
      args: [ // If you don't want args, just delete everything from this line to
        {
          id: "member",
          type: "member",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid member...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member...`,
          },
        },
      ], // this line!
    });
  }

  public async exec(
    message: Message,
    { member }: { member: GuildMember } // since type: "string" above, type it as string
  ): Promise<void> { // U don't have to hard type the Promise being Message, it can also be Promise<void> if you just do a blank return;
    function makeid(length) {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    let nick = makeid(6)
    let nickname = (`Moderated Nickname ${nick}`)

    await member.setNickname(nickname, `Nickname Moderated by ${message.author.tag}`);
    const msg = await message.reply(`Changed!`)
    setTimeout(() => {
       msg.delete()
       message.delete() 
    }, 4000);
    return
  }
}