---
'@envsemble/envui': minor
---

List rows can be the current one, lead with content and be put in order.

- `List.Item` takes `selected`, the current row of a list beside its details, in the selected fill with `aria-current="true"` on its row target; `start`, content before the label, such as an Avatar, an icon or a Checkbox, whose checked state gives its row the selected fill; and `textValue`, the row's label as text where `label` isn't one.
- `List.Root` takes `onReorder(from, to)`, which gives each row a drag handle. Space or Enter on the handle lifts the row, the arrow keys, Home and End move it while the other rows make room, Space or Enter drops it and Escape puts it back; Alt+↑ and Alt+↓ on a row target move its row at once; and the handle drags the row with a pointer, scrolling the scroll area near its edges. Each step is announced from a polite live region with the row's position and the count, from the new `messages.list` strings, and focus stays on the control that moved the row. Nothing moves until the row is dropped, when the application moves the item in its own state.
