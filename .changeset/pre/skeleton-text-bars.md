---
'@envsemble/envui': patch
---

Skeletons look the same throughout: text that is there, such as a heading that doesn't wait for data, draws as rounded bars over its line boxes that shimmer with the rest, rather than a square line through it, which stays only until the script measures the text, as from a server. The skeleton's own surfaces, such as a card or a list row, carry a fainter highlight in step with the bars. A root that scrolls, such as a wide skeleton Table or a tall skeleton Dialog, draws the bars past its box too. The root takes `data-env-skeleton-text` while it draws them.
