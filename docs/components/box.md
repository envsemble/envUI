---
title: Box
summary: A plain block for padding, container queries, or a name that styles and tests can target.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - div
  - block
  - wrapper
  - inset
  - padding
  - container
  - size container
  - container query
  - region
useWhen:
  - An inset and nothing else, such as around a region of a page
  - A region whose width the application's own styles respond to
  - A region the application's styles or tests find by name
avoidWhen:
  - text: Children one under another with gaps.
    use: Column
  - text: Children side by side with gaps.
    use: Row
  - text: A background, a border or corners.
    use: Surface
components:
  - Box
examples:
  InsetRegion:
    role: overview
    motion: true
---

# Box
