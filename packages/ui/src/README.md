# Component source

Basic components and types are exported through `index.ts`; optional code/Markdown rendering
and editing use `content.ts`. Keep application imports on `@envsemble/envui` and
`@envsemble/envui/content`; folders below organize implementation rather than package entry points.

- `foundations/`: theme boundaries, layout, surfaces, and typography.
- `actions/`: native button/link behavior and button appearance.
- `navigation/`: navigation items, directional links, and tabs.
- `content/`: Card and its separate ActionCard, ClickableCard and FeatureCard compositions,
  GroupedRows, disclosures, information chips, code and Markdown rendering.
  Its `internal/` folder owns lazy highlighting and the standard GitHub themes.
- `forms/`: input, textarea, Markdown editing, checkbox, switch, radio, and select components.
  Their `internal/` folder owns field metadata, checked state and native form reset handling.
  Its `markdown/` folder groups formatting, shared editing history and the standard link dialog/toolbar.
- `feedback/`: dialogs, empty/loading states, skeletons, and notifications. The `toast/`
  folder separates presentation, region rendering, and notification lifecycle management.
  ToastTypes owns the public contracts; ToastInternals owns delivery, timer and placement details.
- `internal/`: shared native action behavior, CSS classes, decorative icons, and forwarded refs.
- `styles/`: purpose-specific stylesheets, imported through `styles/index.css`.

`icons/`, `BrandLogo.tsx`, and `EnvUILogo.tsx` are generated assets. Their generators use
root `Icon.tsx` and `MaterialSymbolState.tsx`; keep those shared imports available.
