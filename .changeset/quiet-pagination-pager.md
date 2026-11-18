---
'@envsemble/envui': minor
---

Pagination and Pager are quiet neutral controls. Pagination's previous and next buttons are ghost icon buttons by default, with no fill until hovered; `variant` still takes another. A Pager link has no box or edge and a muted arrow, and takes the neutral hover and pressed fill of a quiet button with the control corners.

Breaking changes:

- Pagination's `variant` defaults to `ghost` rather than `secondary`: write `variant="secondary"` for the filled buttons.
- A Pager link (`env-pager-link`) no longer draws a border on the raised surface or the primary color on its arrow; give its class a border and background for the earlier look.
