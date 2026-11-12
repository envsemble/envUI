---
'@envsemble/envui': patch
---

A Sheet, and a NavigationDrawer in one, is solid within `--env-motion-duration-fast` as it slides in, with `--env-motion-ease-enter`, rather than fading in over the medium duration, so a sheet as wide as a phone's window no longer shows the page through it as it opens; the backdrop keeps the slower fade.
