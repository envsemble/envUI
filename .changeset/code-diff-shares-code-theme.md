---
'@envsemble/envui': patch
---

CodeDiff shares CodeBlock's code theme: its tokens take exactly a code block's colors in the light, dark and high-contrast themes, and it sits on a code block's translucent layer instead of an opaque grey, so it stands a step apart from a page, card or popup as a block does. Added and removed lines are tinted with their change color at an opacity over that layer, chosen so that every token keeps 4.5:1, or 7:1 under high contrast, on the line and on a changed word.
