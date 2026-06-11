import { apiRequest } from "~/lib/api.client";
import type { Contact, Deal, Interaction, InteractionType } from "./types";

function unwrap<T>(res: { success: boolean; data?: T; message?: string }): T {
  if (!res.success) throw new Error(res.message || "Request failed");
  return res.data as T;
}

// ── Contacts ──────────────────────────────────────────────────────────────
export const ContactsApi = {
  async list(q?: string): Promise<Contact[]> {
    const res = await apiRequest<Contact[]>("/api/crm/contacts", {
      method: "GET",
      params: q ? { q } : undefined,
    });
    return unwrap(res) ?? [];
  },
  async get(id: string): Promise<Contact> {
    return unwrap(await apiRequest<Contact>(`/api/crm/contacts/${id}`, { method: "GET" }));
  },
  async create(payload: Partial<Contact>): Promise<Contact> {
    return unwrap(
      await apiRequest<Contact>("/api/crm/contacts", { method: "POST", data: payload }),
    );
  },
  async update(id: string, payload: Partial<Contact>): Promise<Contact> {
    return unwrap(
      await apiRequest<Contact>(`/api/crm/contacts/${id}`, { method: "PATCH", data: payload }),
    );
  },
  async remove(id: string): Promise<void> {
    unwrap(await apiRequest(`/api/crm/contacts/${id}`, { method: "DELETE" }));
  },
};

// ── Interactions ────────────────────────────────────────────────────────────
export const InteractionsApi = {
  async list(params: { contactId?: string; dealId?: string }): Promise<Interaction[]> {
    const res = await apiRequest<Interaction[]>("/api/crm/interactions", {
      method: "GET",
      params,
    });
    return unwrap(res) ?? [];
  },
  async create(payload: {
    contactId: string;
    type: InteractionType;
    body: string;
    dealId?: string;
    occurredAt?: string;
  }): Promise<Interaction> {
    return unwrap(
      await apiRequest<Interaction>("/api/crm/interactions", { method: "POST", data: payload }),
    );
  },
  async remove(id: string): Promise<void> {
    unwrap(await apiRequest(`/api/crm/interactions/${id}`, { method: "DELETE" }));
  },
};

// ── Deals ────────────────────────────────────────────────────────────────────
export const DealsApi = {
  async list(): Promise<Deal[]> {
    return unwrap(await apiRequest<Deal[]>("/api/crm/deals", { method: "GET" })) ?? [];
  },
  async create(payload: Partial<Deal>): Promise<Deal> {
    return unwrap(await apiRequest<Deal>("/api/crm/deals", { method: "POST", data: payload }));
  },
  async update(id: string, payload: Partial<Deal>): Promise<Deal> {
    return unwrap(
      await apiRequest<Deal>(`/api/crm/deals/${id}`, { method: "PATCH", data: payload }),
    );
  },
  async move(id: string, stage: string, orderedIds: string[]): Promise<Deal> {
    return unwrap(
      await apiRequest<Deal>(`/api/crm/deals/${id}/move`, {
        method: "POST",
        data: { stage, orderedIds },
      }),
    );
  },
  async remove(id: string): Promise<void> {
    unwrap(await apiRequest(`/api/crm/deals/${id}`, { method: "DELETE" }));
  },
};
