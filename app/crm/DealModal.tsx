import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";
import type { Contact, Deal } from "./types";
import type { TPipelineStage } from "~/modules/configurables/src/constants/configurables.default";

export function DealModal({
  open,
  onClose,
  onSave,
  onDelete,
  deal,
  stages,
  contacts,
  defaultStage,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Deal>) => Promise<void>;
  onDelete?: () => Promise<void>;
  deal?: Deal | null;
  stages: TPipelineStage[];
  contacts: Contact[];
  defaultStage?: string;
}) {
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState(defaultStage ?? stages[0]?.key ?? "lead");
  const [value, setValue] = useState("");
  const [contactId, setContactId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(deal?.title ?? "");
    setStage(deal?.stage ?? defaultStage ?? stages[0]?.key ?? "lead");
    setValue(deal?.value ? String(deal.value) : "");
    setContactId(deal?.contactId ?? "");
    setNotes(deal?.notes ?? "");
  }, [open, deal, defaultStage, stages]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        stage,
        value: Number(value) || 0,
        contactId,
        notes,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deal ? "Edit deal" : "New deal"}
      footer={
        <div className="flex w-full items-center justify-between">
          {deal && onDelete ? (
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                await onDelete();
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? "Saving..." : "Save deal"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Deal name">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Website redesign for Acme"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stage">
            <Select value={stage} onChange={(e) => setStage(e.target.value)}>
              {stages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Value (USD)">
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
        <Field label="Linked contact">
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, next steps, anything that keeps this moving."
          />
        </Field>
      </div>
    </Modal>
  );
}
