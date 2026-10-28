---
'@envsemble/envui': patch
---

A theme or contrast switch through ThemePreferenceProvider shows the new colors in one frame: transitions are suspended while the page restyles, rather than easing hundreds of colors over the next frames, and the document root takes the theme in the same frame as the provider's boundary. On a catalogue page, the switch paints in about 32 ms instead of 40 to 58, with about 38 ms of style work instead of 170. A provider with `applyToDocument={false}` leaves its transitions as they were.
