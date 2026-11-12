---
'@envsemble/envui': major
---

What Menubar.Menu's `onOpenChange` receives is `Menubar.MenuFocusDetails`, the element that had focus before the menubar took it, under a name no other menu's details share. `Menubar.MenuOpenChangeDetails` is gone: write `Menubar.MenuFocusDetails` in its place, the same details.
