---
'@envsemble/envui': patch
---

The theme rules of `styles.css` no longer repeat a token's value where the rules below already give it, such as a dark value that is the light one: 5 KB less, with every token computing as before.
