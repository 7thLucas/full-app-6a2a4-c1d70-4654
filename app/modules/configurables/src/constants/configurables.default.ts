/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPipelineStage = {
  key: string;
  label: string;
  color: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline: string;
  pipelineStages: TPipelineStage[];
  emptyPipelineText: string;
  emptyContactsText: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "MyCRM",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#1E3A8A",
    secondary: "#F1F5F9",
    accent: "#14B8A6",
  },
  tagline: "Keep every relationship moving forward.",
  pipelineStages: [
    { key: "lead", label: "Lead", color: "#64748B" },
    { key: "contacted", label: "Contacted", color: "#3B82F6" },
    { key: "proposal", label: "Proposal", color: "#F59E0B" },
    { key: "won", label: "Won", color: "#14B8A6" },
    { key: "lost", label: "Lost", color: "#9F1239" },
  ],
  emptyPipelineText:
    "No deals yet. Add your first deal to start tracking what's moving — and what's stalling.",
  emptyContactsText:
    "No contacts yet. Add the people and companies you're working with to get started.",
};
