---
'@envsemble/envui': patch
---

A checked or mixed Checkbox, a Switch that is on and a chosen Radio that are disabled take the neutral fill, `--env-color-bg-neutral-muted`, with their mark, thumb or dot in `--env-color-fg-disabled`, rather than a faded primary, as a disabled button does; their labels still fade. A Checkbox with `aria-readonly` keeps its colors and doesn't answer the pointer.
