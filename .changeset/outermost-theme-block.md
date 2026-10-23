---
'@envsemble/envui': patch
---

The outermost Theme, the `env-window` container, is a block with `box-sizing: border-box`: one that renders an inline element now takes its parent's width, so its container queries match, and one with padding stays inside its parent instead of overflowing it. Any class an application sets overrides both, as before.
