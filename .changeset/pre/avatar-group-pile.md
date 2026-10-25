---
'@envsemble/envui': patch
---

AvatarGroup rests as a compact pile, like stacked cards, each avatar a little off the line and turned, and the pile is one pointer target: hovering it, a tap on it or keyboard focus inside it spreads the group along its arch, and its avatars take presses and hovers only once the spread has ended, so no avatar under another can be pressed (WCAG 2.5.8). This replaces the looser rest that kept 1.5 rem of each pressable avatar uncovered. On touch screens, where groups used to stay a plain row, the first tap spreads a group, marked with `data-spread`, and later taps reach its avatars; a tap outside it or five seconds without a tap pile it up again. Keyboard focus spreads a group only with a focus ring, so a click no longer holds it spread after the pointer leaves. The count of the rest is a rounded square the size of the avatars, with corners from the corner scale, at the bottom of the pile.
