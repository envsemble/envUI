---
'@envsemble/envui': minor
---

DocumentTabs: a tab's `label` takes content, such as a dimmed folder before a name two tabs share, and the tab, its native tooltip, its close button and its context menu are named by its text: the new `textValue`, else the label when it is a string, else the label's rendered text. A tab's new `itemProps` sets more props on its element, such as a className or data attributes for tests; its `onPointerDown`, `onMouseDown` and `onAuxClick` run before the tab's own, and its other handlers after the tab's own. The type of `DocumentTabsItem.label` widens from `string` to `ReactNode`: tabs an app passes in keep working, and code that reads `label` back as a string needs a check that it is one, or `textValue`. See [DocumentTabs](https://github.com/envsemble/envUI/blob/main/docs/components/document-tabs.md).
