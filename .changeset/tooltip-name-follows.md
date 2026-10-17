---
'@envsemble/envui': patch
---

Tooltip reads its control's name as assistive technology does, without text hidden from it, such as an `aria-hidden` arrow, and follows the name while the tooltip is open, so a control whose name and tooltip turn to "Copied" together isn't described by words that repeat its name. A disabled control's stand-in follows its control through a mutation observer instead of reading it again on every render.
