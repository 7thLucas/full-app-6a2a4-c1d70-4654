import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import { Shell } from "~/crm/Shell";
import { Avatar, Button, Field, Input, Modal, Spinner, Textarea } from "~/crm/ui";
import { ContactsApi } from "~/crm/api";
import type { Contact } from "~/crm/types";
import { useConfigurables } from "~/modules/configurables";
import { defaultConfigurablesData } from "~/modules/configurables/src/constants/configurables.default";

export function meta() {
  return [{ title: "Contacts — MyCRM" }];
}

export default function ContactsPage() {
  const { config } = useConfigurables();
  const emptyText = config?.emptyContactsText ?? defaultConfigurablesData.emptyContactsText;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load(q?: string) {
    setLoading(true);
    try {
      setContacts(await ContactsApi.list(q));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query.trim() || undefined), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <Shell>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Contacts</h1>
            <p className="text-sm text-slate-500">
              {contacts.length} {contacts.length === 1 ? "person" : "people"}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New contact
          </Button>
        </div>

        <div className="px-5 py-4 md:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, or email"
              className="pl-9"
            />
          </div>
        </div>

        <div className="px-5 pb-10 md:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="h-7 w-7" />
            </div>
          ) : contacts.length === 0 ? (
            <EmptyContacts query={query} text={emptyText} onAdd={() => setModalOpen(true)} />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {contacts.map((c) => (
                <li key={c._id}>
                  <Link
                    to={`/contacts/${c._id}`}
                    className="flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {c.company && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {c.company}
                          </span>
                        )}
                        {c.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(c) => setContacts((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))}
      />
    </Shell>
  );
}

export function ContactModal({
  open,
  onClose,
  onSaved,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (c: Contact) => void;
  contact?: Contact | null;
}) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: contact?.name ?? "",
      company: contact?.company ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      notes: contact?.notes ?? "",
    });
  }, [open, contact]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const saved = contact
        ? await ContactsApi.update(contact._id, form)
        : await ContactsApi.create(form);
      onSaved(saved);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Edit contact" : "New contact"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Saving..." : "Save contact"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name">
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company">
            <Input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </Field>
        </div>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@acme.com"
          />
        </Field>
        <Field label="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="How you met, what they care about, anything useful."
          />
        </Field>
      </div>
    </Modal>
  );
}

function EmptyContacts({
  query,
  text,
  onAdd,
}: {
  query: string;
  text: string;
  onAdd: () => void;
}) {
  if (query) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 text-center">
        <p className="text-sm text-slate-500">No contacts match “{query}”.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, #1E3A8A, #14B8A6)" }}
      >
        <Plus className="h-7 w-7" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">No contacts yet</h2>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{text}</p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add your first contact
      </Button>
    </div>
  );
}
