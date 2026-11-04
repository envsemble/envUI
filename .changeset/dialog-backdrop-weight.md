---
'@envsemble/envui': patch
---

The backdrop behind dialogs and the command palette is lighter in light, where it turned the page mid-gray, and a real darkening in dark, where the page color at half opacity hardly showed: `--env-color-bg-backdrop` is the dark page color at 32% in light and black at 50% in dark, and the lighter `--env-color-bg-backdrop-muted` behind a sheet 20% and black at 30%. A dialog in dark has the popups' faint hairline edge, so it stands clear of the darkened page.

Where dialogs, sheets and the command palette are solid, with reduced transparency, their light edge, `--env-elevation-3-border`, is the default border's gray, so it still stands out against the lighter backdrop.
