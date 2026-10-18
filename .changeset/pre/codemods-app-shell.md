---
'@envsemble/envui-codemods': minor
---

A new `v1-app-shell` transform rewrites 0.x's AppShell into the frame's parts, after `v1-names` names it `AppShell.Root`: `navigation` and `navigationLabel` become a `Sidebar.Root` with a `NavList.Root` in `Sidebar.Content`, `brand` a `SidebarTrigger` with its `mark`, placed with `context` in `Sidebar.Header` or, for `topbar="full"` (`headerSpan="full"`), in `AppShell.Header`'s `start`, `title` and `actions` the header's children and `end`, `sidebarContent` a `Sidebar.Content fill`, and the page `AppShell.Main`. `storageKey` is `persist`, the collapsed props are negated into the open ones, and pixel widths become rem. AppShellSkeleton becomes the same parts with `NavList.Skeleton` in a LoadingState, and `const { closeNarrowSidebar } = useAppShell()` becomes `useSidebar()`'s `dismiss`. `v1-classes` renames the frame's classes and reports those 1.0 drops, with the root's state attributes, and the 0.x sidebar width properties.
