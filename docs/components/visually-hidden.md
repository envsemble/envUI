---
title: VisuallyHidden
summary: Text that assistive technology reads and the screen doesn't show.
status: beta
since: 2.0.0
category: Text & content
aliases:
  - visually hidden
  - screen reader only
  - sr-only
  - assistive text
  - hidden label
useWhen:
  - Words that complete a short label, such as /mo read as per month
  - A heading over a region whose purpose shows without one
avoidWhen:
  - text: A name for a button that shows only an icon.
    use: IconButton
  - text: Brief feedback after an action, such as Saved.
    use: ToastProvider
components:
  - VisuallyHidden
examples:
  PricePerMonth: overview
---

# VisuallyHidden
