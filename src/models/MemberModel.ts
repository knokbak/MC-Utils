import { ModelOptions, prop, Severity } from "@typegoose/typegoose";

export interface CaseInfo {
  caseID: any;
  moderator: string;
  moderatorId: string;
  user: string;
  date: string;
  type: string;
  reason: string;
  time?: string;
}

interface Mutes {
  muted: boolean;
  endDate: number;
  case: any;
}

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class MemberModel {
  @prop()
  id!: string;
  @prop()
  userId!: string;
  @prop()
  guildId!: string;
  @prop({ default: [] })
  sanctions!: Array<CaseInfo>;
  @prop({ default: { muted: false, endDate: null, case: null } })
  mute!: Mutes;
}
