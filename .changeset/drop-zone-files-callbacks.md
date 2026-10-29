---
'@envsemble/envui': minor
'@envsemble/envui-codemods': minor
---

DropZone's `onDropAccepted` and `onDropRejected` are `onFilesAccepted` and `onFilesRejected`: they run for browsed files as well as dropped ones. `v1-props` writes the new names for 0.x's `onFiles` and `onReject`.
