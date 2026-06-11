export interface Contact {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InteractionType = "call" | "email" | "meeting" | "note";

export interface Interaction {
  _id: string;
  contactId: string;
  dealId: string;
  type: InteractionType;
  body: string;
  occurredAt: string;
  createdAt?: string;
}

export interface Deal {
  _id: string;
  title: string;
  stage: string;
  value: number;
  contactId: string;
  notes: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
