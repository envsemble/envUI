---
'@envsemble/envui': patch
---

A Scaffold loads the code that scrolls its body with the keyboard only with `scroll="body"`, as the body mounts, so a page whose document scrolls no longer downloads it. A key pressed before it has arrived scrolls the body once it has.
