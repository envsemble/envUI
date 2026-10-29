---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
---

envUI responds to containers at window classes rather than to the viewport: compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, which `windowClasses`, `WindowClass` and the `--env-window-class-*` tokens hold.

- The outermost theme boundary, the themed document root or the Theme around the application, is the `env-window` size container, and takes the whole width its parent gives it. Style sheets write compact first and switch up, as in `@container env-window (width >= 37.5rem)`, so content without a window stays compact. A region becomes a window of its own with `<Box container="env-window">`.
- Where the document root isn't themed, a portal's boundary is the window: a popup's is a box out of the page's flow, as wide as the document, and a modal surface's (Dialog, ConfirmDialog, Sheet, CommandPalette) has no box: the surface's positioner, fixed over the viewport, is the window instead, so the scrim and the surface keep their own layers under the menus, toasts and tooltips opened over them. Under a themed root, popups' boundaries have no box, as before.
- Card's feature layout and PageHeader take their wide layout from 37.5 rem of their own width (38 and 32 rem before), and DatePicker sets its time beside the calendar from a medium `env-window` rather than a viewport of 32 rem.
- The viewport breakpoint helpers and tokens of earlier prereleases (`breakpoints`, `Breakpoint`, `breakpointQuery`, `useBreakpoint`, `useMediaQuery`, `MediaQueryOptions` and `--env-breakpoint-*`) are gone: `v1-names` reports the exports and `v1-classes` the tokens.

Migration guide: [Window classes and container queries](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
