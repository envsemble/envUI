---
'@envsemble/envui': patch
---

TableOfContents keeps its headings while a modal popup, such as a dialog or the command palette, is open. The popup hides the page behind it from assistive technology, and a heading change read during that time used to empty the list and hide it.
