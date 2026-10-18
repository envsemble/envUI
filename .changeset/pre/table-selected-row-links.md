---
'@envsemble/envui': patch
---

Links and text buttons in a selected table row take the selection's text color, `--env-color-fg-on-selected`, at rest, on hover and on press, also while the row is under the pointer or holds focus. The link blue measured 4.33:1 on the selection fill in the light theme, and 4.06:1 on the hovered one. The row sets the link colors to it, so icon-only text buttons and links in rich text follow; danger text buttons keep the danger color.
