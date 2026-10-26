---
'@envsemble/envui': patch
---

Markdown keeps its elements when it renders again with a new `renderLink`, such as an inline function: the headings, links, code and tables it renders are the same elements, so a page's anchors, focus and scroll position survive, and only what changed renders again. TableOfContents follows the page's scrolling also after its sections render anew, where its marks once stayed on the section a link had chosen.
