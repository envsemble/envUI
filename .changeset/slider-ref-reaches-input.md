---
'@envsemble/envui': minor
'@envsemble/envui-codemods': minor
---

Slider's `ref` reaches its native range input, the element that holds the value and takes focus, as every field's `ref` does, so a form library can register it; `inputRef` is gone, and `v1-props` renames it to `ref`. `className`, `style` and the other native props still go to the root. DropZone keeps `inputRef` for its file picker, and says why.
