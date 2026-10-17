---
'@envsemble/envui': minor
---

CopyButton takes `write`, a clipboard writer of the application's own, such as a desktop shell's bridge, used instead of the browser's Clipboard API; a promise that rejects shows and announces "Couldn’t copy". CopyButton copies through the shared copy logic that CodeBlock will use too.
