---
'@envsemble/envui': major
---

A drag takes one state name for each meaning:

- `data-dragging`, a continuous control's thumb on the move: Slider's field takes it while pressed, where it took `data-pressed`.
- `data-moving="pointer"`, an item being reordered: DocumentTabs' dragged tab, where it took `data-dragging`, as List's rows do.
- `data-resizing`, a handle that resizes: `env-resize-handle`, Sheet's and Drawer's, and Textarea's `env-textarea-resize-handle`, where they took `data-dragging`.
- `data-drag-over`, a drop target under dragged files: DropZone, where it took `data-dragging`.
