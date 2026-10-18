---
'@envsemble/envui': patch
---

Highlighted code is readable in both app themes and under high contrast. Code blocks and code diffs keep the Pierre code themes, but each token color below 4.5:1 on code's background, or below 7:1 where the nearest Theme's contrast is high (or `system` while `prefers-contrast: more`), takes the closest color of the same hue that reaches it, with as much of its chroma as the color space allows: in the light theme the oranges, yellows, greens and cyans are darker, and in the dark theme the grey of comments and JSX text is lighter. Tokens that had different colors keep visibly different ones. Code diffs also keep their tokens readable on the lines they tint for additions and deletions, and their change counts on code's background. The colors are computed when code first loads, from whichever version of `@pierre/theme` is installed.
