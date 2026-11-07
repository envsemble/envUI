---
'@envsemble/envui': patch
---

TextField's notch closes at the pace its floated label settles, so the edge never crosses the label; a Tooltip grows in from the same size as the other popups; and the pickers' fields keep their focused frame and label, `data-popup-open` on `env-date-picker-control`, until the popup has closed.
