import { ModelOptions, prop, Severity } from "@typegoose/typegoose";

@ModelOptions({ options: { allowMixed: Severity.ALLOW }})
export default class GuildModel {
  @prop()
  id!: string;
  @prop({ default: 0 })
  casesCount!: number;
  @prop({ default: {} })
  membersData!: object;
  @prop()
  members!: string[]
}
