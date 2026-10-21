---
'@envsemble/envui': major
---

envUI responds to containers at Material's window classes rather than to the viewport at breakpoints: compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem.

- The theme boundary (`.env-theme`), on the themed document root, a Theme or a dialog's portal, is the `env-window` size container: `@container env-window (width < 37.5rem)` is compact. A Theme that is a flex item or in an `auto` grid track needs a width of its own, as any size container does.
- `windowClasses` and `WindowClass` replace `breakpoints`, `Breakpoint` and `breakpointQuery`; the `--env-window-class-medium`, `-expanded` and `-large` tokens replace `--env-breakpoint-sm` … `-xl`.
- `useBreakpoint` and `useMediaQuery` are gone: write a container query, or measure the element whose width decides with `useContainerSize`.
- Card's feature layout and PageHeader move to their compact layout below 37.5 rem of their own width (38 and 32 rem before), and DatePicker stacks its time under the calendar in a compact `env-window` rather than a viewport below 32 rem.

Migration guide: [Window classes and container queries](https://github.com/envsemble/envUI/blob/main/docs/migration.md#window-classes-and-container-queries).
