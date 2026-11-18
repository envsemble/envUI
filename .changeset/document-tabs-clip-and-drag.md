---
'@envsemble/envui': minor
---

DocumentTabs' strip clips tabs that run past its edges and scrolls, with no fade at its ends; the active tab scrolls whole into view. Dragging a tab to reorder it no longer selects it: a tab is chosen by a click or the keyboard, not by pressing it to drag or by dropping it.

Breaking changes:

- The strip's `data-fade-left` and `data-fade-right` states are gone, with its mask at the ends: style overflow from the application, such as a shadow on `env-document-tabs-list`, where it wants one.
