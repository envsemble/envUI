---
'@envsemble/envui': patch
---

A disabled Toolbar.Root or Toolbar.Group disables its Toolbar.Link too: the link reports `aria-disabled`, has no destination, leaves the arrow keys' path and shows no tooltip, as a disabled button does.
