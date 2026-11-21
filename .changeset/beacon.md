---
'@envsemble/envui': minor
---

Beacon: a new component that draws a soft halo breathing around what it holds, to point at the one control or region to look at next, such as the first step of onboarding or a product tour. The halo stays outside its content, takes no room and is hidden from assistive technology; it holds still with a reduced-motion preference and shows in the system highlight color with forced colors. `tone` is `accent` or `primary`, `--env-beacon-indicator` gives it any other color, and `--env-beacon-radius` the corners it follows. `render={<div />}` wraps a block, and without children a Beacon is the box the application places, such as over a region it measured. See [Beacon](https://github.com/envsemble/envUI/blob/main/docs/components/beacon.md).
