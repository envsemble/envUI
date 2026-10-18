---
'@envsemble/envui': patch
---

Labels no longer break mid-word in Firefox:

- A `Disclosure`'s summary keeps a one-word title such as Code on one line; long words still wrap when the summary is narrower than they are.
- A `Toast`'s action keeps its label on one line and the message wraps beside it; only a label longer than half the toast wraps.
