---
'@envsemble/envui': major
---

Popover and HoverCard size to their content, from 12 rem up to their `width`, so a short note or a single field no longer sits in a wide empty card. Menus, tooltips, popovers, hover cards and the date, month and time pickers' popups are never wider than the room their positioner finds beside the trigger (`--available-width`), rather than the window less 2 rem, so they stay on screen in any frame.

Migration: `width` (`md` 20 rem, `lg` 28 rem) is now the maximum, not a fixed width. To keep a fixed width, set `inline-size` through `className`, such as `.rename-popover { inline-size: 28rem; }`.

Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).
