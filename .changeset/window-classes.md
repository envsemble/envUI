---
'@envsemble/envui': major
---

envUI responds to containers at window classes rather than to the viewport: compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, which `windowClasses`, `WindowClass` and the `--env-window-class-*` tokens hold.

- The outermost theme boundary, the themed document root or the Theme around the application, is the `env-window` size container, and takes the whole width its parent gives it. Style sheets write compact first and switch up, as in `@container env-window (width >= 37.5rem)`, so content without a window stays compact. A region becomes a window of its own with `<Box container="env-window">`.
- The portal boundary of a menu, popover or other popup is a block, which is the window where the document root isn't themed.
- Card's feature layout and PageHeader take their wide layout from 37.5 rem of their own width (38 and 32 rem before), and DatePicker sets its time beside the calendar from a medium `env-window` rather than a viewport of 32 rem.
- The viewport breakpoint helpers and tokens of earlier prereleases (`breakpoints`, `useBreakpoint`, `useMediaQuery`, `--env-breakpoint-*`) are gone.

Migration guide: [Window classes and container queries](https://github.com/envsemble/envUI/blob/main/docs/migration.md#window-classes-and-container-queries).
