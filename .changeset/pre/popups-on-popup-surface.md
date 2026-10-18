---
'@envsemble/envui': major
---

Popover, HoverCard and Tooltip open on the shared popup surface.

- Popover's and HoverCard's `width` is `md`, the default, or `lg`, where it was `standard` or `wide`. Popover's `side` takes `inline-start` and `inline-end`, and the `onOpenChange` of Popover and HoverCard receives the reason as its second argument (`PopoverOpenChangeReason`).
- `className`, `style`, `ref` and data attributes of Popover and HoverCard reach their popup, and Tooltip's `popupClassName` its popup; each popup takes the text direction of its trigger. Their theme and positioner classes are `env-popup-theme` and `env-popup-positioner`, and HoverCard's surface is `env-hover-card`.
- A Tooltip describes a control with a name of its own while it is open (`aria-describedby` to its `role="tooltip"` popup). Around a disabled button, link, tab or menu item, its wrapper is a tab stop where it can read the control's name, and takes its role and name with `aria-disabled`, and a button's or tab's pressed, expanded, popup and selected state. A disabled checkbox, radio, switch, slider or select keeps its own role and state, with no stand-in. A Kbd in a tooltip takes light key caps.

Migrate with the codemods: `envui-codemods v1-props` maps `width` and reports an expression.

Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).
