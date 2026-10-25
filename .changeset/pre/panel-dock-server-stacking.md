---
'@envsemble/envui': patch
---

PanelDock stacks from a container query, so the server's markup of a narrow dock already stacks and the first paint matches what the dock shows once it hydrates, without a jump. The dock is now an inline-size container: an unnamed `@container` query in panel content resolves against it, and its own font size is `stackBelow` / 37.5, which panels and tabs reset.
