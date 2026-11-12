---
'@envsemble/envui': patch
---

The row densities of Table and List differ by at least 4 px of row height in the compact scale, where `xs` and `sm` were 2 px apart: `--env-row-padding-block-xs` is 0 and `-sm` 2 px, and `md`, the default, and `lg` keep their heights; the comfortable scale is unchanged, and so are a Tree's rows. A zero size token keeps its unit, such as `0rem`, so it adds in a `calc()`.
