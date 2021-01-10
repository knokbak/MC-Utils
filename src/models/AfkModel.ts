import { ModelOptions, prop, Severity } from "@typegoose/typegoose";

export interface AfkStatus {
    isAfk: boolean;
    status: string;
}

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class AfkModel {
    @prop()
    id!: string;
    @prop()
    userId!: string;
    @prop()
    guildId!: string;
    @prop()
    afk!: AfkStatus;
}