---
'@envsemble/envui': patch
---

A disabled RichTextEditor no longer fades as a whole: its document takes `--env-color-fg-disabled` and its outline the muted border, as a disabled TextField does, so it stays readable, also in dark.
