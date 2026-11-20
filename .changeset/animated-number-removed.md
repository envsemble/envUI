---
'@envsemble/envui': major
---

AnimatedNumber leaves the library: a number that rolls to its new value is one effect, not a component every app needs. An app that wants it copies the example on [Typography](https://github.com/envsemble/envUI/blob/main/docs/foundations/typography.md) into its own code: a span whose new value rolls in with the Web Animations API, timed by `--env-motion-duration-medium` and `--env-motion-ease-enter`, and changes without moving under `prefers-reduced-motion: reduce`.

Breaking changes:

- `AnimatedNumber` and `AnimatedNumberProps` are removed, with the parts `env-animated-number`, `env-animated-number-value` and `env-animated-number-previous` and their states `data-direction` (`up` and `down`) and `data-value`: write the number as plain text, such as `Show {total} tasks`, or copy the rolling number example from Typography's page.
