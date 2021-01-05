import { ModelOptions, prop, Severity } from "@typegoose/typegoose";
import { CaseInfo, Mutes } from "./MemberModel";

export interface AutoModSettings {
    messageLengthLimit: number;
    mentionLimit: number;
    nWordFilter: boolean;
    filterURLs: boolean;
    exemptRoles: string[];
}

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class AutoModModel {
    @prop()
    id!: string;
    @prop()
    userId!: string;
    @prop()
    guildId!: string;
    @prop({ default: [] })
    sanctions!: CaseInfo[];
    @prop()
    mute!: Mutes;
    @prop()
    autoModSettings: AutoModSettings;
}