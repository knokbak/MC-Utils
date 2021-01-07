import { Command } from "discord-akairo";
import { GuildMember } from "discord.js";
import { Message } from "discord.js";
// Replace everything prefixed with commandName or commandUsage with an actual value, duh :D
export default class CommandName extends Command {
  public constructor() {
    super("nickname", {
      aliases: ["nickname", "nick"],
      channel: "guild",
      category: "categoryName",
      userPermissions: ["MANAGE_NICKNAMES"], 
      clientPermissions: ["MANAGE_NICKNAMES"], 
      ratelimit: 3, // Usually keep this
      description: { // All of this below for the help command
        content: "Changes the nickname of a user",
        usage: "moderate [ID or Mention] (New Nickname)",
        examples: ["nickname 378025254125305867 menin", "nick @Menin#4642"],
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
        {
            id: "nickname",
            type: "string",
            match: "restContent",
            default: ""
        }
      ], // this line!
    });
  }

  public async exec(
    message: Message,
    { member, nickname }: { member: GuildMember; nickname: string} // since type: "string" above, type it as string
  ): Promise<Message> { // U don't have to hard type the Promise being Message, it can also be Promise<void> if you just do a blank return;
    if(!nickname){
        try{
            member.setNickname(nickname);
        }catch(e){
            return message.reply(`Couldn't reset **${member.user.tag}**'s nickname.`)
        }
        
        message.reply(`Nickname for **${member.user.tag}** reset`)
    }else{
        try{
            member.setNickname(nickname)
        }catch(e){
            return message.reply(`Couldnt change **${member.user.tag}**'s nickname.`)
        }
        
        message.reply(`Nickname for **${member.user.tag}** changed to ${nickname}`)
    }
  }
}