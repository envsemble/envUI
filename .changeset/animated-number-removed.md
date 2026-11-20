---
'@envsemble/envui': major
---

AnimatedNumber leaves the library: a number that rolls to its new value is one effect, not a component every app needs.

Breaking changes:

- `AnimatedNumber` and `AnimatedNumberProps` are removed, with the parts `env-animated-number`, `env-animated-number-value` and `env-animated-number-previous` and their states `data-direction` (`up` and `down`) and `data-value`: write the number as plain text, such as `Show {total} tasks`. An app that wants it to roll animates it itself, timed by `--env-motion-duration-medium` and `--env-motion-ease-enter`, and only under `prefers-reduced-motion: no-preference`.
