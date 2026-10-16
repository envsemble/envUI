---
'@envsemble/envui': minor
---

`breakpoints` (`{ sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' }`, the breakpoint tokens' values) and `breakpointQuery(breakpoint, 'up' | 'down')`, which returns the media query from a breakpoint up, such as `(width >= 48rem)`, or below it. `useMediaQuery(query, { defaultValue })` tells whether the viewport matches a media query and follows its changes, and `useBreakpoint(breakpoint, { defaultValue })` whether the viewport is at least as wide as a breakpoint. On the server and while hydrating, both return `defaultValue` (false), so hydration meets the server's markup; the browser's answer follows. A new foundations page, Responsive layout & stacking, documents them, when to use container queries instead, and the stacking tokens.
