---
'@envsemble/envui': minor
---

Breadcrumbs: a crumb's `label` takes any content again, as in 1.x, such as an Avatar before a project's name. It names the crumb's link or button, the trail still cuts it short beyond 20 rem, and the tooltip then shows the same content in full. The type widens from `string` to `ReactNode`: labels an app passes in keep working, and code that reads `label` back as a string needs a check that it is one. See [Breadcrumbs](https://github.com/envsemble/envUI/blob/main/docs/components/breadcrumbs.md).
