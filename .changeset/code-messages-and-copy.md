---
'@envsemble/envui': major
---

CodeBlock and CodeDiff take their words from EnvUIProvider's `messages.codeBlock` and `messages.codeDiff`: the heading of a block without a label or language, the copy button's names and announcements, the name of the code region, and CodeDiff's loading name, error, its description and Retry. CodeBlock copies as CopyButton does: where the Clipboard API is unavailable it copies a selection of a hidden field, and only where that fails too does it select the code for people to copy. Its visually hidden status is `env-code-block-copy-status`, where it was `env-code-copy-status`; `v1-classes` renames it.
