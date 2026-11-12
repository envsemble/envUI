---
'@envsemble/envui': minor
---

Avatar, AvatarButton and AvatarGroup show a person's initials without a picture by default, so people tell their avatars apart, in place of the same default person picture for everyone; an empty name still shows the person picture. To keep the person picture, pass `fallback="person"`, such as for a guest; `fallback="initials"` is now the default and can go. In an AvatarGroup each avatar takes a ring in the color of the surface below, about 2 px, in place of its faint shadow, so the initials of avatars lying on one another never run together and the last avatar stays apart from the count. A Table rings them in its surface, with a hovered or selected row's fill over it.
