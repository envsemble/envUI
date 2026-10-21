---
'@envsemble/envui': patch
---

envUI draws no line that only divides: things separate by space and background. Menu.Separator and Toolbar.Separator are space, with no line, and keep their `separator` role. DocumentTabs' bar, a sticky PageHeader and the command palette's footer have no line under or over them. A docked panel's header takes the muted fill, `--env-color-bg-muted`, instead of a line once its content scrolls beneath it, and keeps a line in forced colors. Panes.Divider shows a short grip at rest instead of a line, and its line still shows on hover, focus and while dragging. A rule (`hr`) in Markdown, RichText and the editors is three quiet dots in more space than between paragraphs. Dev mode's inspector sits beside the view without a line. Tables keep their row lines, and controls, quotes, keys and floating layers keep their edges. No class, prop or token changes: where an application needs a line, give the part its own `border`.

Migration guide: [Navigation and collections](https://github.com/envsemble/envUI/blob/main/docs/migration.md#navigation-and-collections).
