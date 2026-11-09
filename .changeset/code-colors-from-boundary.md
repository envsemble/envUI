---
'@envsemble/envui': patch
---

Code, CodeBlock and CodeDiff take their code theme's colors from the nearest Theme boundary's style sheet rather than an inline style of their own, so a page rendered on the server shows code in the reader's theme before it hydrates, as the bootstrap script themes the root; once hydrated nothing changes. A CodeDiff still showing the theme before a switch keeps that theme's colors until the new one loads, as before. Code no longer needs a client component around it.
