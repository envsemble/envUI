---
'@envsemble/envui': patch
---

An avatar and AvatarGroup's count cast a faint, small shadow, 1 px down and 3 px soft, in a deeper shade of the surface below them, stronger on a dark surface than on a light one, so the avatars of a group part from the one they lie on. It is envUI's one drop shadow; `--env-avatar-group-ring` sets the surface it follows, it is gone under forced colors, and a chosen avatar keeps its rings alone.
