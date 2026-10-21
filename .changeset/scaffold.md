---
'@envsemble/envui': minor
---

Scaffold, the invisible structure of an application's screen, after Material's: a top bar region, the navigation and a body that scrolls under the top bar. It shows one navigation form at a time by its own width, in CSS: the Bar at the bottom of a compact width, the Rail at the start of a medium one and the Drawer from expanded, from `navigation={{ bar, rail, drawer }}`, and `forms` changes which form each window class shows. It renders skip links to the body and the navigation, the banner and main landmarks, keeps clear of the safe areas, and lets the keyboard scroll the body as it would the document. `data-env-layout="scaffold"`, and the `env-scaffold` container. `resolveNavigationForms` returns the form of each window class.
