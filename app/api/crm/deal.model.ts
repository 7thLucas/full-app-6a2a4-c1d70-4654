import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_deals",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Deal extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: String, default: "lead", index: true })
  stage!: string;

  @prop({ type: Number, default: 0 })
  value!: number;

  @prop({ type: String, default: "" })
  contactId!: string;

  @prop({ type: String, default: "" })
  notes!: string;

  // Manual ordering within a stage column (lower = higher in the list)
  @prop({ type: Number, default: 0 })
  order!: number;
}

export const DealModel = getModelForClass(Deal);
