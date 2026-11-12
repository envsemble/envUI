---
'@envsemble/envui': minor
---

Dialogs follow the popups' rules: Dialog, ConfirmDialog and the dialogs built on them, such as MarkdownEditor's and RichTextEditor's Insert link dialog, take the popup's color, `--env-color-bg-popup` in light and `--env-color-bg-default` in dark, with the popups' soft shadow, `--env-popup-shadow`, and no outline edge. Unlike popups they stay solid, not frosted: over the scrim, what shows through only greyed the dialog and smudged it with the shapes behind. At high contrast, with `prefers-reduced-transparency` and under forced colors, a dialog has no shadow and its elevation edge returns, as a popup's does. No token changes.
