---
'@envsemble/envui': patch
---

A Switch that is off has a muted thumb, `--env-color-border-default-pressed`, at 3:1 on its track, rather than the near-black control color, so it no longer outweighs a switch that is on; under the pointer and while pressed it darkens to `--env-color-fg-muted` with the ring. A switch that is on and unavailable takes a faint tint of the primary, `--env-color-bg-primary-muted`, rather than the neutral fill, so it differs from an unavailable switch that is off by more than the thumb's place.
