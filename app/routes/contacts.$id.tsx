import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Pencil,
  Trash2,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Users,
  StickyNote,
  Plus,
} from "lucide-react";
import { Shell } from "~/crm/Shell";
import { ContactModal } from "./contacts._index";
import {
  Avatar,
  Button,
  Spinner,
  Textarea,
  formatRelative,
  formatCurrency,
} from "~/crm/ui";
import { cn } from "~/lib/utils";
import { ContactsApi, InteractionsApi, DealsApi } from "~/crm/api";
import type { Contact, Deal, Interaction, InteractionType } from "~/crm/types";
import { useConfigurables } from "~/modules/configurables";
import { defaultConfigurablesData } from "~/modules/configurables/src/constants/configurables.default";

const TYPE_META: Record<
  InteractionType,
  { label: string; icon: typeof PhoneIcon; color: string }
> = {
  call: { label: "Call", icon: PhoneIcon, color: "#1E3A8A" },
  email: { label: "Email", icon: MailIcon, color: "#0EA5E9" },
  meeting: { label: "Meeting", icon: Users, color: "#7C3AED" },
  note: { label: "Note", icon: StickyNote, color: "#14B8A6" },
};

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useConfigurables();
  const stages = config?.pipelineStages?.length
    ? config.pipelineStages
    : defaultConfigurablesData.pipelineStages;

  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [type, setType] = useState<InteractionType>("note");
  const [body, setBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const [c, ints, allDeals] = await Promise.all([
        ContactsApi.get(id),
        InteractionsApi.list({ contactId: id }),
        DealsApi.list(),
      ]);
      setContact(c);
      setInteractions(ints);
      setDeals(allDeals.filter((d) => d.contactId === id));
    } catch {
      setContact(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const stageLabel = useMemo(
    () => Object.fromEntries(stages.map((s) => [s.key, s])),
    [stages],
  );

  async function addInteraction() {
    if (!id || !body.trim()) return;
    setAdding(true);
    try {
      const created = await InteractionsApi.create({ contactId: id, type, body: body.trim() });
      setInteractions((prev) => [created, ...prev]);
      setBody("");
      setType("note");
    } finally {
      setAdding(false);
    }
  }

  async function removeInteraction(intId: string) {
    await InteractionsApi.remove(intId);
    setInteractions((prev) => prev.filter((i) => i._id !== intId));
  }

  async function removeContact() {
    if (!contact) return;
    if (!confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
    await ContactsApi.remove(contact._id);
    navigate("/contacts");
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-32">
          <Spinner className="h-7 w-7" />
        </div>
      </Shell>
    );
  }

  if (!contact) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="mb-4 text-sm text-slate-500">This contact could not be found.</p>
          <Link to="/contacts">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to contacts
            </Button>
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="border-b border-slate-200 bg-white px-5 py-4 md:px-8">
        <Link
          to="/contacts"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Contacts
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={contact.name} size={52} />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {contact.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                {contact.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {contact.company}
                  </span>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={removeContact}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-5 py-6 md:grid-cols-3 md:px-8">
        {/* Timeline */}
        <div className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Interaction timeline</h2>

          {/* Fast inline add */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(Object.keys(TYPE_META) as InteractionType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                const active = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                      active
                        ? "text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                    style={active ? { background: meta.color } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addInteraction();
              }}
              placeholder={`Log a ${TYPE_META[type].label.toLowerCase()}… (⌘/Ctrl + Enter to save)`}
              className="min-h-[60px]"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={addInteraction} disabled={adding || !body.trim()}>
                <Plus className="h-4 w-4" />
                {adding ? "Logging..." : "Log it"}
              </Button>
            </div>
          </div>

          {interactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
              No interactions logged yet. Capture your first touch above.
            </div>
          ) : (
            <ol className="relative space-y-3 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {interactions.map((int) => {
                const meta = TYPE_META[int.type] ?? TYPE_META.note;
                const Icon = meta.icon;
                return (
                  <li key={int._id} className="relative flex gap-3 pl-0">
                    <span
                      className="z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ring-4 ring-background"
                      style={{ background: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="group flex-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {formatRelative(int.occurredAt || int.createdAt)}
                          </span>
                          <button
                            onClick={() => removeInteraction(int._id)}
                            className="text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                            aria-label="Delete interaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{int.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Side: linked deals + notes */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Linked deals</h2>
            {deals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-400">
                No deals linked to this contact yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {deals.map((d) => {
                  const stage = stageLabel[d.stage];
                  return (
                    <Link
                      key={d._id}
                      to="/pipeline"
                      className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                      style={{ borderLeft: `3px solid ${stage?.color ?? "#94a3b8"}` }}
                    >
                      <p className="text-sm font-medium text-slate-900">{d.title}</p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{stage?.label ?? d.stage}</span>
                        {d.value > 0 && (
                          <span className="font-semibold text-accent">
                            {formatCurrency(d.value)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </ul>
            )}
          </div>

          {contact.notes && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Notes</h2>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm whitespace-pre-wrap text-slate-700 shadow-sm">
                {contact.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      <ContactModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        contact={contact}
        onSaved={(c) => setContact(c)}
      />
    </Shell>
  );
}
