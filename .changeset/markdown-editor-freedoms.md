---
'@envsemble/envui': minor
---

MarkdownEditor: `toolbarEnd` adds the application's own toolbar buttons after Undo and Redo, such as a mention, an emoji or an AI rewrite, and as a function receives `insert`, which puts text at the selection as one step Undo takes back. `mode`, `defaultMode` and `onModeChange` drive the Write and Preview view, and `viewSwitch={false}` hides the built-in switch so the application's own control can switch it. `previewProps` also takes `components`, `remarkPlugins`, `rehypePlugins` and `allowHtml`, so the preview matches what the application publishes. See [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md).
