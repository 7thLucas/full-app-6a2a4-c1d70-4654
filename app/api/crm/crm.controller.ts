import type { Request, Response } from "express";
import { ContactModel } from "./contact.model";
import { InteractionModel } from "./interaction.model";
import { DealModel } from "./deal.model";

const notDeleted = { deletedAt: { $in: [null, undefined] } };

function fail(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message });
}

// ── Contacts ────────────────────────────────────────────────────────────────

export async function listContacts(req: Request, res: Response) {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { company: rx }, { email: rx }];
    }
    const contacts = await ContactModel.find(filter).sort({ name: 1 }).lean();
    return res.json({ success: true, data: contacts });
  } catch (e) {
    console.error("listContacts", e);
    return fail(res, 500, "Failed to load contacts");
  }
}

export async function getContact(req: Request, res: Response) {
  try {
    const contact = await ContactModel.findOne({ _id: req.params.id, ...notDeleted }).lean();
    if (!contact) return fail(res, 404, "Contact not found");
    return res.json({ success: true, data: contact });
  } catch (e) {
    console.error("getContact", e);
    return fail(res, 500, "Failed to load contact");
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    const { name } = req.body ?? {};
    if (!name || !String(name).trim()) return fail(res, 400, "Name is required");
    const contact = await ContactModel.create({
      name: String(name).trim(),
      company: req.body.company ?? "",
      email: req.body.email ?? "",
      phone: req.body.phone ?? "",
      notes: req.body.notes ?? "",
    });
    return res.status(201).json({ success: true, data: contact.toObject() });
  } catch (e) {
    console.error("createContact", e);
    return fail(res, 500, "Failed to create contact");
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const allowed = ["name", "company", "email", "phone", "notes"] as const;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in (req.body ?? {})) update[key] = req.body[key];
    }
    if ("name" in update && !String(update.name).trim()) {
      return fail(res, 400, "Name cannot be empty");
    }
    const contact = await ContactModel.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      update,
      { new: true },
    ).lean();
    if (!contact) return fail(res, 404, "Contact not found");
    return res.json({ success: true, data: contact });
  } catch (e) {
    console.error("updateContact", e);
    return fail(res, 500, "Failed to update contact");
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const contact = await ContactModel.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      { deletedAt: new Date() },
      { new: true },
    ).lean();
    if (!contact) return fail(res, 404, "Contact not found");
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    console.error("deleteContact", e);
    return fail(res, 500, "Failed to delete contact");
  }
}

// ── Interactions ──────────────────────────────────────────────────────────────

export async function listInteractions(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = { ...notDeleted };
    if (req.query.contactId) filter.contactId = req.query.contactId;
    if (req.query.dealId) filter.dealId = req.query.dealId;
    const interactions = await InteractionModel.find(filter)
      .sort({ occurredAt: -1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: interactions });
  } catch (e) {
    console.error("listInteractions", e);
    return fail(res, 500, "Failed to load interactions");
  }
}

export async function createInteraction(req: Request, res: Response) {
  try {
    const { contactId, type, body } = req.body ?? {};
    if (!contactId) return fail(res, 400, "contactId is required");
    if (!body || !String(body).trim()) return fail(res, 400, "Details are required");
    const validTypes = ["call", "email", "meeting", "note"];
    const interaction = await InteractionModel.create({
      contactId: String(contactId),
      dealId: req.body.dealId ?? "",
      type: validTypes.includes(type) ? type : "note",
      body: String(body).trim(),
      occurredAt: req.body.occurredAt ? new Date(req.body.occurredAt) : new Date(),
    });
    return res.status(201).json({ success: true, data: interaction.toObject() });
  } catch (e) {
    console.error("createInteraction", e);
    return fail(res, 500, "Failed to log interaction");
  }
}

export async function deleteInteraction(req: Request, res: Response) {
  try {
    const interaction = await InteractionModel.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      { deletedAt: new Date() },
      { new: true },
    ).lean();
    if (!interaction) return fail(res, 404, "Interaction not found");
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    console.error("deleteInteraction", e);
    return fail(res, 500, "Failed to delete interaction");
  }
}

// ── Deals ────────────────────────────────────────────────────────────────────

export async function listDeals(_req: Request, res: Response) {
  try {
    const deals = await DealModel.find(notDeleted)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, data: deals });
  } catch (e) {
    console.error("listDeals", e);
    return fail(res, 500, "Failed to load deals");
  }
}

export async function createDeal(req: Request, res: Response) {
  try {
    const { title } = req.body ?? {};
    if (!title || !String(title).trim()) return fail(res, 400, "Deal title is required");
    const stage = req.body.stage ? String(req.body.stage) : "lead";
    // Place new deal at the top of its column.
    const top = await DealModel.findOne({ stage, ...notDeleted })
      .sort({ order: 1 })
      .lean();
    const order = top ? (top as any).order - 1 : 0;
    const deal = await DealModel.create({
      title: String(title).trim(),
      stage,
      value: Number(req.body.value) || 0,
      contactId: req.body.contactId ?? "",
      notes: req.body.notes ?? "",
      order,
    });
    return res.status(201).json({ success: true, data: deal.toObject() });
  } catch (e) {
    console.error("createDeal", e);
    return fail(res, 500, "Failed to create deal");
  }
}

export async function updateDeal(req: Request, res: Response) {
  try {
    const allowed = ["title", "stage", "value", "contactId", "notes", "order"] as const;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in (req.body ?? {})) update[key] = req.body[key];
    }
    if ("title" in update && !String(update.title).trim()) {
      return fail(res, 400, "Deal title cannot be empty");
    }
    if ("value" in update) update.value = Number(update.value) || 0;
    const deal = await DealModel.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      update,
      { new: true },
    ).lean();
    if (!deal) return fail(res, 404, "Deal not found");
    return res.json({ success: true, data: deal });
  } catch (e) {
    console.error("updateDeal", e);
    return fail(res, 500, "Failed to update deal");
  }
}

export async function moveDeal(req: Request, res: Response) {
  try {
    const { stage, orderedIds } = req.body ?? {};
    if (!stage) return fail(res, 400, "stage is required");
    // Update the moved deal's stage.
    await DealModel.updateOne(
      { _id: req.params.id, ...notDeleted },
      { stage: String(stage) },
    );
    // Re-sequence the destination column by the provided id order.
    if (Array.isArray(orderedIds)) {
      await Promise.all(
        orderedIds.map((id: string, idx: number) =>
          DealModel.updateOne({ _id: id, ...notDeleted }, { order: idx, stage: String(stage) }),
        ),
      );
    }
    const deal = await DealModel.findOne({ _id: req.params.id, ...notDeleted }).lean();
    return res.json({ success: true, data: deal });
  } catch (e) {
    console.error("moveDeal", e);
    return fail(res, 500, "Failed to move deal");
  }
}

export async function deleteDeal(req: Request, res: Response) {
  try {
    const deal = await DealModel.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      { deletedAt: new Date() },
      { new: true },
    ).lean();
    if (!deal) return fail(res, 404, "Deal not found");
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    console.error("deleteDeal", e);
    return fail(res, 500, "Failed to delete deal");
  }
}
