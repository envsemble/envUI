---
'@envsemble/envui': patch
---

Disclosure and Accordion show hover and press: a Disclosure's summary and an Accordion's heading lay the shared state layer, `--env-color-bg-neutral-subtle-hover` and `-pressed`, where they looked as at rest. A Disclosure's summary takes it in a small rounded rectangle a little past its words, its margin taking that back, and its focus ring takes those rounded corners rather than square ones; an Accordion's heading takes it inset from the hairlines, with its ring tracing it, and its title and panel sit 8 px in from the hairlines to match.
