---
'@envsemble/envui': major
---

envUI ships no logos: BrandLogo and EnvUILogo, with their props types, are gone, and so is the brand artwork among the package's assets: the envUI lockups and favicons under `@envsemble/envui/assets/envUI/` and the envsemble lockup. The package README no longer shows a logo.

Keep your artwork in the application, as an SVG file or a component that draws it with `Icon`, which follows the text color. The codemods report each use (`envui-codemods v1-names`), and the ESLint plugin's `no-renamed-exports` reports the imports.
