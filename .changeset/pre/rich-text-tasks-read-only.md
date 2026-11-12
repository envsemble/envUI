---
'@envsemble/envui': patch
---

RichText and a read-only RichTextEditor show a task's checkbox read-only rather than disabled: in full color, with `aria-readonly`, out of the tab order, and a press doesn't change it, so finished text no longer looks greyed out; a disabled editor's tasks stay disabled. The checkbox sits on the middle of the first line of its text rather than a little above it.
