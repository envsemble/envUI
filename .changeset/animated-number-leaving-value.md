---
'@envsemble/envui': minor
---

AnimatedNumber keeps the value it changed from while it leaves, `env-animated-number-previous`, which rolls out in `--env-motion-duration-fast` with `--env-motion-ease-exit` as the new value rolls in in `--env-motion-duration-medium` with `--env-motion-ease-enter`, so the number is never gone for a moment; with reduced motion they cross-fade. The leaving value is hidden from assistive technology and drawn from its `data-value`, so the text is still only the current value.
