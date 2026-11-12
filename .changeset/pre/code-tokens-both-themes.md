---
'@envsemble/envui': patch
---

A highlighted CodeBlock's tokens carry their colors in both code themes, and the style sheet shows those of the nearest Theme: the same markup in either theme, so code highlighted on the server before the page hydrates shows the reader's theme's colors, and switching the theme no longer renders every token again.
