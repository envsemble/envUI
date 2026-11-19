---
'@envsemble/envui': minor
---

DocumentTabs: a tab's `content` shows in place of its label, such as a dimmed folder before a name two tabs share, and its `end` holds content after the name, such as a dot for unsaved changes or a Badge of errors; the label still names the tab and its close button. A tab whose `closable` is false has no close button and stays open on a middle click, Delete and Backspace, such as a pinned or welcome tab, and its context menu leaves out Close. The new `contextMenu` adds the application's own items, such as Close others or Copy path, after the built-in ones, for the tab people open the menu on or the strip around the tabs. See [DocumentTabs](https://github.com/envsemble/envUI/blob/main/docs/components/document-tabs.md).
