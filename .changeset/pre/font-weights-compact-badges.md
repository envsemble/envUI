---
'@envsemble/envui': patch
---

A font-weight scale, compact counters and document tabs, and smaller fixes.

- The new `--env-font-weight-regular`, `--env-font-weight-medium` and `--env-font-weight-semibold` tokens (400, 500 and 600) are the font weights. The body and heading type roles and every component take their weights from them.
- Counter badges and diff stats are a size smaller in the compact scale, 1 rem rather than 1.25 rem, from the new `--env-counter-badge-height` token, and badges, counters and diff stats take the caption size of the scale. The DocumentTabs strip is as tall as a medium control, 2 rem in the compact scale rather than 2.5 rem.
- In an AvatarGroup, each avatar covers an eighth of the one before rather than a quarter, and initials center in the part of the circle the next avatar leaves uncovered, so they stay readable.
- The gap cursor of RichText no longer blinks under reduced motion.
- Card, List and RadioGroup lay out with logical properties where they still used physical ones.
