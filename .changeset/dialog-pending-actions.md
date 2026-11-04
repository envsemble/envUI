---
'@envsemble/envui': minor
---

While a Dialog or a Sheet is `pending`, every DialogClose inside it is disabled, as the built-in close button is, and its last action, the primary one, shows the pending state where it is a Button that sets no `pending` of its own, so `pending` no longer needs setting on each button.
