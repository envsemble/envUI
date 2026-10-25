---
'@envsemble/envui': minor
---

TableOfContents, the page's sections as links, nested by level, with the section the reader is in marked as they scroll: a dot before each section, darker once passed, and the current one's grows into an accent pill down its label; nested sections step in. It reads the headings in a container, `[2, 3]` by default through `levels`, giving those without an id one, or takes sections of your own as `items`, any element with an id under a label of yours. A link scrolls smoothly to its section, at once where reduced motion is preferred, below a sticky header's scroll margin, adds it to the address and moves focus to it. The landmark is named On this page, from `messages.tableOfContents`, and the current link takes `aria-current="location"`.
