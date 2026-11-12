---
'@envsemble/envui': minor
---

One `HeadingLevel` type, `1 | 2 | 3 | 4 | 5 | 6`, types every `headingLevel`, in place of `Accordion.AccordionHeadingLevel`, `CardHeadingLevel` and `TableOfContentsHeadingLevel`; Accordion and Drawer take `Exclude<HeadingLevel, 1>`.
