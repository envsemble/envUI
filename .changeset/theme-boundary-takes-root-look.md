---
'@envsemble/envui': major
---

A ThemePreferenceProvider that applies to the document, outside any Theme, renders its boundary around the children as a plain element that takes the root's look and sets envUI's type again, as a boundary does, with none of a Theme's `env-theme` class and `data-env-theme`, `data-env-contrast` and `data-env-scale` attributes, which the root already carries: the same element before and after a pre-rendered page hydrates, so hydrating no longer restyles the whole page. Its theme, contrast and scale still reach nested Themes, popups and `useTheme()`. Style the application by the root's attributes, such as `[data-env-theme='dark'] .app`, rather than the boundary's. A provider given a `system` contrast while the page set a contrast of its own on the root keeps a boundary of its own.
