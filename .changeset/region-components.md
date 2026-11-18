---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Components that fill a region of the screen fill it edge to edge with square corners by default, and an application still rounds or spaces one with its own class, as any element: `.inbox { border-radius: var(--env-radius-lg); }` rounds Panes, and the panes inside follow its corners, since the root clips them. DocumentTabs' root clips to the radius it is given in the same way.

Breaking changes:

- **Panes sit side by side on a hairline**: the gap between two panes is the control border width rather than 1 rem of the page. A `Panes.Divider` draws a 1 px line in `--env-color-border-muted` there, CanvasText under forced colors, and keeps a 0.75 rem hit area, the touch height under a coarse pointer, that reaches only into the pane after it, so the scrollbar and controls at the edge of the pane before it stay reachable; without a divider the panes are a hairline apart with no line. An application that wants the panes apart sets a margin or a gap on them.
