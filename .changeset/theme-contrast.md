---
'@envsemble/envui': patch
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

**The light and dark themes keep things apart, and alike.** Nothing changes its role or API; colors take other grades of the same roles, so apps that use the tokens follow without changes.

- Light surfaces sit a step apart: the default, muted and recessed surfaces are a grade or two deeper, fields a grade deeper, and raised surfaces, recessed surfaces and popups take a faint frosted edge, as dark popups had, and `Surface background="raised"` takes the filled surface's fill in light, so a raised panel reads as its own background on the white page, as it does in dark.
- The dark page is a grade darker, with the recessed surface and fields below it, and the muted surface a grade lighter, so panes, cards and navigation stand off the page.
- Selection stays apart from hover, press and the list cursor: light selection is two grades deeper, popup rows give the cursor a quieter fill than the selection, light navigation hover and press are translucent layers, and dark table rows hover below a full-strength selection.
- The light primary color is a grade deeper at rest, hover and press, and the light focus ring a grade deeper; dark primary and danger fills press two grades from rest.
- State steps show in both themes: field hover borders, ghost fields from read-only to hover, segments, menubar triggers, toolbar toggles, cards, radios, drop zones, tree rows, sortable table headers, resize grips and the color picker button.
- Tracks, slider fills and ticks, the AvatarGroup overflow chip, soft neutral and done badges, the contents wave, dark tooltips, dark alerts, the heatmap's lowest levels and a failed message's edge are firmer; out-of-range calendar dates are dimmed once instead of twice; a field's prefix and suffix take the full muted text color.
- A solid count badge takes its tone's text color, so a dark danger count is white like the danger badge.
