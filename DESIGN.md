# MyCRM — Design Guidelines

## Aesthetic
Clean, uncluttered productivity-tool look. Calm and confident. Generous whitespace, fast-feeling interactions, nothing decorative that doesn't aid the task. Think Linear/Notion-level restraint.

## Color palette
- **Primary (deep blue):** #1E3A8A — headers, primary actions, active states.
- **Accent (teal):** #14B8A6 — highlights, success/Won states, drag affordances, links.
- **Gradient:** deep-blue → teal for the brand mark and hero accents only; use sparingly.
- **Surfaces:** white (#FFFFFF) cards and panels on a light-slate background (#F8FAFC / #F1F5F9).
- **Text:** slate-900 (#0F172A) primary, slate-500 (#64748B) secondary.
- **Borders/dividers:** slate-200 (#E2E8F0), subtle.
- **Pipeline stage cues:** Lead (slate), Contacted (blue), Proposal (amber #F59E0B), Won (teal), Lost (muted rose/slate).

## Typography
Clean sans-serif (Inter or system UI stack). Clear hierarchy: bold semibold headings, regular body. Avoid heavy/condensed display faces. Comfortable line-height.

## Components
- **Cards:** rounded corners (rounded-lg/xl), soft shadows (subtle elevation), white surface, slate-200 border.
- **Kanban board:** the day-one hero. Columns per stage with clear headers and deal counts; deal cards are draggable across columns with smooth drag affordance (lift shadow on grab). Card shows deal name, linked contact, value, and stage.
- **Contacts directory:** clean list/table with avatar initials, name, company, quick actions.
- **Interaction timeline:** vertical timeline per contact, type icons (call/email/meeting/note), timestamp, fast inline add.
- **Buttons:** primary = deep blue fill; secondary = slate outline; accent actions in teal. Rounded, medium weight.
- **Inputs:** light-slate fill or white with slate-200 border, clear focus ring (blue/teal).

## Layout
Sidebar or top nav with three primary views: Pipeline (default/hero), Contacts, and per-contact Timeline. Spacious, single-column-friendly, responsive. Empty states are encouraging and point the user to add their first deal/contact.

## Motion
Subtle and purposeful: smooth card drag, gentle hover elevation, quick fade/slide for panels. Nothing flashy.