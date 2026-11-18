---
'@envsemble/envui': patch
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

**The light and dark themes keep things apart, and alike.** Colors take other grades of the same roles, so apps that use the tokens follow without changes.

- Light surfaces sit a step apart: the default and muted surfaces are a grade or two deeper, fields a grade deeper, and the recessed surface four grades deeper (`#dadadc`), a well that cards and list rows stand out in as they do in dark's. `Surface background="raised"` takes the default surface's tint in light, so a raised panel reads as its own background on the white page, as it does in dark.
- The dark page is a grade darker, with the recessed surface and fields below it, and the muted surface a grade lighter, so panes, cards and navigation stand off the page.
- Raised and recessed Surfaces take a faint 1 px frosted edge in both themes, which makes one sized by its content 2 px larger; in light, popups, dialogs, the command palette, rich text suggestions and tooltips take the same edge that dark popups had.
- Selection stays apart from hover, press and the list cursor: light selection is two grades deeper, and a selected item under the pointer or pressed a grade deeper still, so it never lands on a surface's gray; popup rows give the cursor a quieter fill than the selection; light navigation hover and press are translucent layers; dark table rows hover below a full-strength selection.
- The light primary color is two grades deeper at rest, hover and press, the light focus ring a grade deeper, and light primary, danger, success, accent and done text, the default border and the popup and dialog edges a grade deeper, so they keep their contrast on the deeper recessed surface; dark primary and danger fills press two grades from rest.
- State steps show in both themes: field hover borders, ghost fields from read-only to hover, segments, menubar triggers, toolbar toggles, cards, radios, drop zones, tree rows, sortable table headers, resize grips and the color picker button.
- Disabled states stay readable: checkbox and radio labels take the disabled text color (GrayText under forced colors), a disabled chosen radio its gray, a disabled pressed toggle a faded fill, a disabled chosen segment its fill with the label in the disabled text color, and a disabled card's description a little more contrast. An invalid Slider takes the danger edge invalid fields have.
- Tracks, slider fills and ticks, the AvatarGroup overflow chip, soft neutral and done badges, the contents wave, dark tooltips, dark alerts, the heatmap's lowest levels and a failed message's edge are firmer, and soft badges in a selected table row keep the table's ground; out-of-range calendar dates are dimmed once instead of twice; a field's prefix and suffix take the full muted text color.
- A solid count badge takes its tone's text color, so a dark danger count is white like the danger badge.
