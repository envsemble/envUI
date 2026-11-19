# Release notes

<!--
The highlights on the Docs' Changelog page: one entry per release of @envsemble/envui, newest
first, each with up to five highlights in plain sentences and a short list of breaking changes. Each
breaking change links to its release's entry in the full changelog below them, /docs/changelog#….
scripts/site/ReleaseNotes.ts reads and checks this file; the full changelog is packages/ui/CHANGELOG.md.

## <version> — <YYYY-MM-DD, or Upcoming>
- A highlight.
### Breaking changes
- A change, [with a link to its entry](/docs/changelog#release).
-->

## 2.1.0 — 2026-11-19

- A breadcrumb's label takes any content again, as in 1.x, such as an avatar before a project's name.

## 2.0.0 — 2026-11-19

- [envUI 2.0](/docs/changelog#200--2026-11-19) steers by its code and looks quieter: buttons and fields share one corner, secondary buttons are a quiet fill and fields show their label above the box.
- The light and dark themes keep surfaces a step apart, selection apart from hover, and show nothing in one theme that disappears in the other.
- EmptyState, ResizeHandle and VisuallyHidden are new; Panes only splits a region into two panes, with a resize handle.
- Every slot renders through one Slot part, which places what it holds and never restyles it.
- The lint packages report only what is always wrong, and each message says what to write instead.

### Breaking changes

- Tabs, LineArt and PanelDock are removed: views of the same content switch with a SegmentedControl, and a panel kept open beside the page is a Sheet or a pane of Panes. [See 2.0.0](/docs/changelog#200--2026-11-19).
- Panes is one part, `Panes.Pane`, with an optional `Panes.ResizeHandle`; `behavior`, `splitAt` and the supporting pane's open state are gone. [See 2.0.0](/docs/changelog#200--2026-11-19).
- A field's label sits above its box, and the notched border and `data-label-floating` are gone. [See 2.0.0](/docs/changelog#200--2026-11-19).
- `Code` and `CodeBlock` move to `@envsemble/envui`; highlighted source is `HighlightedCodeBlock` from `@envsemble/envui/code`. [See 2.0.0](/docs/changelog#200--2026-11-19).
- TopBar's `actions` is renamed `end`, and the patterns and the migration guide are no longer in the package. [See 2.0.0](/docs/changelog#200--2026-11-19).

## 1.0.2 — 2026-11-13

- envUI's page on npm describes it as it is: a React design system for B2B SaaS products and AI developer tools.

## 1.0.1 — 2026-11-13

- A tapped control on a phone no longer shows the browser's square tap highlight; its own press feedback shows instead.

## 1.0.0 — 2026-11-12

- [envUI 1.0](/docs/changelog#100--2026-11-12) is the first stable release: from here, a breaking change waits for a major version.
- It is free and open source under the MIT license, and installs from npm with no account or token.
- Every component, pattern and foundation is one page of Markdown, which the catalogue shows to people, the Docs to developers and the package to coding agents.
- One prompt sets envUI up with a coding agent: `Set up envUI in my app: envui.envsemble.com/SKILL.md`.
