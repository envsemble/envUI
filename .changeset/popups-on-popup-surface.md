---
'@envsemble/envui': major
---

Popover, HoverCard and Tooltip open on the shared popup surface.

- Popover's and HoverCard's `width` is `md`, the default, or `lg`, where it was `standard` or `wide`. Popover's `side` takes `inline-start` and `inline-end`, and the `onOpenChange` of Popover and HoverCard receives the reason as its second argument (`PopoverOpenChangeReason`).
- `className`, `style`, `ref` and data attributes of Popover, HoverCard and Tooltip reach their popup, which takes the text direction of its trigger. Their theme and positioner classes are `env-popup-theme` and `env-popup-positioner`, and HoverCard's surface is `env-hover-card`.
- A Tooltip describes a control with a name of its own while it is open (`aria-describedby` to its `role="tooltip"` popup). Around a disabled control, its wrapper is a tab stop only where it can read the control's role and name, which it takes, with `aria-disabled`. A Kbd in a tooltip takes light key caps.

Migrate with the codemods: `envui-codemods v1-props` maps `width` and reports an expression.
