---
'@envsemble/envui': minor
---

Markdown: `allowLinkSchemes` lets links take the application's own schemes beside the safe ones, such as `allowLinkSchemes={['vscode']}` for links that open the editor, and keeps the safe-link check for every other link: a `javascript:` link still renders as plain text, and `javascript`, `data` and `vbscript` are refused even when listed. See [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md).
