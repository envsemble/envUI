---
'@envsemble/envui': minor
---

AvatarGroup keeps the room its spread takes, so spreading under the pointer never changes its size: it no longer wraps a narrow row and flickers between bunched and spread. At rest its avatars gather toward the start of that room, or toward the end with the new `gather="end"`, for a group at the end of a row. The count of the rest shows at rest too, under the last avatar, upright and set as initials are, semibold at the avatar's initials size. Avatars in a group and the count no longer take a ring in the color of the surface below, and Avatar's `--env-avatar-ring` hook is gone; `--env-avatar-group-ring` now sets only the gap in a chosen avatar's ring. A new check rejects a hover or focus-within rule that changes layout in any component.
