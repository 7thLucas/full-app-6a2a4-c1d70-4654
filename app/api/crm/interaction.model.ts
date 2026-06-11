import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type InteractionType = "call" | "email" | "meeting" | "note";

@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_interactions",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Interaction extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  contactId!: string;

  @prop({ type: String, default: "" })
  dealId!: string;

  @prop({ type: String, required: true, default: "note" })
  type!: InteractionType;

  @prop({ type: String, required: true, trim: true })
  body!: string;

  @prop({ type: Date, default: () => new Date() })
  occurredAt!: Date;
}

export const InteractionModel = getModelForClass(Interaction);
