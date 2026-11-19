---
'@envsemble/envui': minor
---

Markdown: `allowHtml` keeps raw HTML, such as details, sub, sup or an img with a width, for trusted content such as an application's own docs or a README. Only a rehype-raw in `rehypePlugins` renders it, so give a sanitizer such as rehype-sanitize with it; raw HTML is still dropped by default. See [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md).
