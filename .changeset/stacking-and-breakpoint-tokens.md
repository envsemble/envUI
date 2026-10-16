---
'@envsemble/envui': major
---

Stacking tokens: `--env-z-base` (0), `--env-z-raised` (1), `--env-z-sticky` (20), `--env-z-peek` (30), `--env-z-overlay` (90), `--env-z-modal` (100), `--env-z-popover` (110), `--env-z-toast` (120) and `--env-z-tooltip` (130), one z-index scale for envUI's components and the application's own layers. Every component takes its z-index from them, in the order it had: a tooltip stays above a toast, a toast above a menu, and a menu, a select list or a popover opened inside a dialog above the dialog. A dialog and the command palette sit at `modal`, over their scrim at `overlay`. Give an application's layers a token, with `calc()` for a step between two, such as `calc(var(--env-z-sticky) + 1)`.

Breakpoint tokens: `--env-breakpoint-sm` (40 rem), `-md` (48 rem), `-lg` (64 rem) and `-xl` (80 rem), the viewport widths where a page's layout may change. CSS can't read a custom property inside `@media`, so style sheets write the value itself; components respond to their container's width instead.

`--env-topbar-height` is `--env-app-shell-header-height`, with the same values: 3.25 rem, 2.625 rem in the compact scale, and 3.25 rem under a coarse pointer. `v1-classes` rewrites it, and the names the app frame's sticky offsets had before 1.0, `--topbar-height`, `--app-sticky-top`, `--env-app-sticky-top` and `--env-app-topbar-block-size`, to the 1.0 frame's `--env-app-shell-header-height`, `--env-frame-sticky-top` and `--env-frame-header-block-size`.
