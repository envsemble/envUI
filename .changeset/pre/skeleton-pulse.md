---
'@envsemble/envui': minor
---

Skeletons pulse instead of shimmering: every bar and shape breathes between a stronger and a fainter tone, 1.8 s a breath, in step across the page, and the skeleton's own surfaces, such as cards, surfaces, list rows, a table's header and one's own message bubble, pulse with them, more faintly. With a reduced-motion preference the pulse is slower and shallower, a change of tone only; in forced colors the bars stand still in the system's gray. A popup, dialog or sheet shown as a skeleton stops pulsing as it closes, so it closes with any motion preference. The shimmer's highlight token, `--env-color-skeleton-shine`, is gone, as nothing paints it any more. In the light theme at high contrast, `--env-color-bg-neutral-muted-hover` and `--env-color-bg-neutral-muted-pressed` are as strong as at standard contrast, so skeleton bars, switch tracks and secondary buttons under the pointer are no fainter there.
