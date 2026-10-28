---
'@envsemble/envui': patch
---

Pages load less of envUI's JavaScript. The script that draws a skeleton's text as bars loads only once a skeleton shows, so a component that can be a skeleton, such as Alert, Popover or Menu, no longer brings it along: Alert is 22 % smaller.
