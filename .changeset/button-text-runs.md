---
'@envsemble/envui': patch
---

Button keeps a label's words and a number in their line together, such as Show, an AnimatedNumber and tasks: they are one run of text, `env-button-text`, spaced by word spaces, where the button's gap once stood between each of them as a wide space. Words with an inline element, such as `<strong>`, in their line stay together too; a Badge, a DiffStat or an icon is still an item of its own, the gap apart.
