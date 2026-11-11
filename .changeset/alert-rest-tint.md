---
'@envsemble/envui': patch
---

An Alert rests on its tone's tint, `--env-color-bg-{tone}-muted`, in every theme and contrast, rather than the tone's hover layer, `--env-color-bg-{tone}-subtle-hover`, which its dismiss button and actions still lay on hover. Alerts and toasts take the large corner of the radius scale, `--env-radius-lg`, which the compact scale tightens, rather than a fixed 1.25 rem, so a one-line alert or toast no longer reads as a pill.
