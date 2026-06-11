import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, GripVertical, User2 } from "lucide-react";
import { Shell } from "~/crm/Shell";
import { DealModal } from "~/crm/DealModal";
import { Button, Spinner, formatCurrency } from "~/crm/ui";
import { ContactsApi, DealsApi } from "~/crm/api";
import type { Contact, Deal } from "~/crm/types";
import { useConfigurables } from "~/modules/configurables";
import {
  defaultConfigurablesData,
  type TPipelineStage,
} from "~/modules/configurables/src/constants/configurables.default";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Pipeline — MyCRM" }];
}

export default function PipelinePage() {
  const { config } = useConfigurables();
  const stages: TPipelineStage[] =
    config?.pipelineStages?.length ? config.pipelineStages : defaultConfigurablesData.pipelineStages;
  const emptyText = config?.emptyPipelineText ?? defaultConfigurablesData.emptyPipelineText;

  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [newStage, setNewStage] = useState<string | undefined>(undefined);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const contactMap = useMemo(
    () => Object.fromEntries(contacts.map((c) => [c._id, c])),
    [contacts],
  );

  async function load() {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([DealsApi.list(), ContactsApi.list()]);
      setDeals(d);
      setContacts(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const byStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    for (const s of stages) map[s.key] = [];
    for (const d of deals) {
      if (!map[d.stage]) map[d.stage] = [];
      map[d.stage].push(d);
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => a.order - b.order);
    return map;
  }, [deals, stages]);

  function openNew(stageKey?: string) {
    setEditing(null);
    setNewStage(stageKey);
    setModalOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditing(deal);
    setNewStage(undefined);
    setModalOpen(true);
  }

  async function handleSave(payload: Partial<Deal>) {
    if (editing) {
      const updated = await DealsApi.update(editing._id, payload);
      setDeals((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    } else {
      const created = await DealsApi.create(payload);
      setDeals((prev) => [created, ...prev]);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    await DealsApi.remove(editing._id);
    setDeals((prev) => prev.filter((d) => d._id !== editing._id));
  }

  async function handleDrop(targetStage: string) {
    setOverStage(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const moved = deals.find((d) => d._id === id);
    if (!moved || moved.stage === targetStage) return;

    // Optimistic update: move card to top of target column.
    const updated = deals.map((d) => (d._id === id ? { ...d, stage: targetStage } : d));
    setDeals(updated);
    const orderedIds = [
      id,
      ...byStage[targetStage].filter((d) => d._id !== id).map((d) => d._id),
    ];
    try {
      await DealsApi.move(id, targetStage, orderedIds);
    } catch {
      load();
    }
  }

  const totalValue = useMemo(
    () =>
      deals
        .filter((d) => d.stage !== "lost")
        .reduce((sum, d) => sum + (d.value || 0), 0),
    [deals],
  );

  return (
    <Shell>
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-500">
              {deals.length} deal{deals.length === 1 ? "" : "s"}
              {totalValue > 0 ? ` · ${formatCurrency(totalValue)} in play` : ""}
            </p>
          </div>
          <Button onClick={() => openNew()}>
            <Plus className="h-4 w-4" />
            New deal
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Spinner className="h-7 w-7" />
          </div>
        ) : deals.length === 0 ? (
          <EmptyPipeline text={emptyText} onAdd={() => openNew()} />
        ) : (
          <div className="flex-1 overflow-x-auto p-5 md:p-8">
            <div className="flex gap-4 min-w-max pb-4">
              {stages.map((stage) => {
                const items = byStage[stage.key] ?? [];
                const colTotal = items.reduce((s, d) => s + (d.value || 0), 0);
                return (
                  <div
                    key={stage.key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverStage(stage.key);
                    }}
                    onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
                    onDrop={() => handleDrop(stage.key)}
                    className={cn(
                      "flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/70 transition-colors",
                      overStage === stage.key && dragId && "ring-2 ring-accent/60 bg-accent/5",
                    )}
                  >
                    <div className="flex items-center justify-between px-3 pt-3 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: stage.color }}
                        />
                        <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                          {items.length}
                        </span>
                      </div>
                      <button
                        onClick={() => openNew(stage.key)}
                        className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label={`Add deal to ${stage.label}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {colTotal > 0 && (
                      <p className="px-3 pb-1 text-[11px] font-medium text-slate-400">
                        {formatCurrency(colTotal)}
                      </p>
                    )}
                    <div className="flex flex-1 flex-col gap-2 px-2 pb-2 min-h-[60px]">
                      {items.map((deal) => (
                        <DealCard
                          key={deal._id}
                          deal={deal}
                          contact={contactMap[deal.contactId]}
                          stageColor={stage.color}
                          dragging={dragId === deal._id}
                          onDragStart={() => setDragId(deal._id)}
                          onDragEnd={() => setDragId(null)}
                          onClick={() => openEdit(deal)}
                        />
                      ))}
                      {items.length === 0 && (
                        <button
                          onClick={() => openNew(stage.key)}
                          className="rounded-lg border border-dashed border-slate-300 py-6 text-xs text-slate-400 hover:border-accent hover:text-accent transition"
                        >
                          Drop or add a deal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <DealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        deal={editing}
        stages={stages}
        contacts={contacts}
        defaultStage={newStage}
      />
    </Shell>
  );
}

function DealCard({
  deal,
  contact,
  stageColor,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  deal: Deal;
  contact?: Contact;
  stageColor: string;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-slate-300",
        dragging && "opacity-40 rotate-1 shadow-lg",
      )}
      style={{ borderLeft: `3px solid ${stageColor}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-900">{deal.title}</p>
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-400" />
      </div>
      {deal.value > 0 && (
        <p className="mt-1.5 text-xs font-semibold text-accent">{formatCurrency(deal.value)}</p>
      )}
      {contact ? (
        <Link
          to={`/contacts/${contact._id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary"
        >
          <User2 className="h-3.5 w-3.5" />
          <span className="truncate">{contact.name}</span>
        </Link>
      ) : (
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-300">
          <User2 className="h-3.5 w-3.5" />
          No contact
        </span>
      )}
    </div>
  );
}

function EmptyPipeline({ text, onAdd }: { text: string; onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, #1E3A8A, #14B8A6)" }}
      >
        <Plus className="h-7 w-7" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">Your pipeline starts here</h2>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{text}</p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add your first deal
      </Button>
    </div>
  );
}
