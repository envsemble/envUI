---
'@envsemble/envui': minor
---

Tooltips are frosted, as the other popups are: their strong fill, `--env-color-bg-neutral-strong`, at 82 % over the popups' blur, with 0.75 rem corners, a roomier inset and a small soft shadow, `--env-tooltip-shadow`, in place of their edge. `--env-tooltip-opacity` and `--env-tooltip-shadow`, set on a theme, change them, as the popups' own properties do. At high contrast, with `prefers-reduced-transparency` and under forced colors a tooltip is solid, with its edge and no blur or shadow. A Kbd in a tooltip is a flat chip of the tooltip's text color with no edge, the keys of a combination side by side with the + read but not shown, and a tooltip opens 8 px from its control, as every popup does.
