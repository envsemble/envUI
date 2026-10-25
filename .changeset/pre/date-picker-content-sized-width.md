---
'@envsemble/envui': patch
---

DatePicker and TimePicker keep their minimum width, 12 rem, in a container sized to its content, such as an inline-flex toolbar holding a field and a button. Before, the container measured the field narrower than its minimum, the field then grew to it and pushed its neighbours onto another row, so the field needed a width of its own there. In a container narrower than 12 rem the field still takes the container's width.
