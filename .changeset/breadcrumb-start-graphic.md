---
'@envsemble/envui': minor
---

Breadcrumbs: a crumb takes `start`, a decorative graphic before its label, such as a small Avatar of a project. It sits inside the link or button, centred on the label's line, and is never cut short; it is hidden from assistive technology, so the label still names the crumb and fills its tooltip. A link's hover underline is now drawn on its label (`env-breadcrumbs-label`), so it never runs under the graphic; a rule that turned it off on `env-breadcrumbs-link` now needs to target the label. See [Breadcrumbs](https://github.com/envsemble/envUI/blob/main/docs/components/breadcrumbs.md).
