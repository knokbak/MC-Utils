import { ModelOptions, prop, Severity } from "@typegoose/typegoose";
import { CaseInfo } from "./MemberModel";

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class ModStrikeModel {
  @prop()
  id!: string;
  @prop()
  userId!: string;
  @prop()
  guildId!: string;
  @prop({ default: [] })
  sanctions!: CaseInfo[];
}
