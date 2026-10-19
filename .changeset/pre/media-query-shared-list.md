---
'@envsemble/envui': patch
---

`useMediaQuery` and `useBreakpoint`, and with them a sidebar provider's breakpoint, no longer keep a stale answer in WebKit when the window crosses a breakpoint and comes straight back, as an iPad rotating to portrait and back to landscape does. The hook read each answer from a new MediaQueryList but listened to another one; a render between two frames read the new answer, and WebKit, which sends change events against what a list last answered, sent none as the window went back, so a sidebar its provider hid below the breakpoint stayed hidden. The hooks now read and listen to one list per query, and ask again on resize.
