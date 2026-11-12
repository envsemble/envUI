---
'@envsemble/envui': minor
---

Alert, Badge and Toast lose their outlines. An Alert is filled with its tone's stronger tint, its title takes the tone's color as its icon does, and its corners are a card's, 1.25 rem; a soft Badge in the accent, success, warning or danger tone takes the same stronger tint with a semibold label; a Toast has no edge and takes the alert's corners. At high contrast an Alert keeps the tone's softer tint with an edge in the border color, a Badge the softer tint and a Toast its tone's edge; under forced colors the system paints their edges. `--env-alert-outline` and `--env-toast-outline` still draw an edge at every contrast.
