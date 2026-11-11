---
'@envsemble/envui': patch
---

A page with a Checkbox or a labelled text field no longer has the browser work out the style of the whole page again whenever anything on it changes, such as a menu opening or a row being added: two of their style rules matched in a way that made every change anywhere count. Skeletons that mount together also line up their pulses once rather than each on its own, and skeleton text reads its roots before it sets them. Nothing looks different.
