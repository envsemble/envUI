# Component source

Public components and types are exported through `index.ts`. Keep application imports on
`@envsemble/envui`; the folders below organize implementation rather than new package entry points.

- `foundations/`: theme boundaries, layout, surfaces, and typography.
- `actions/`: native button/link behavior and button appearance.
- `navigation/`: navigation items, directional links, and tabs.
- `content/`: cards, grouped rows, disclosures, information chips, inline code and code blocks.
  Its `internal/` folder owns lazy highlighting and the standard VS Code themes.
- `forms/`: input, textarea, checkbox, switch, radio, and select components. Their
  `internal/` folder owns field metadata, checked state, and native form reset handling.
- `feedback/`: dialogs, empty/loading states, skeletons, and notifications. The `toast/`
  folder separates presentation, region rendering, and notification lifecycle management.
- `internal/`: small shared helpers for CSS classes, decorative icons, and forwarded refs.
- `styles/`: purpose-specific stylesheets, imported through `styles/index.css`.

`icons/`, `BrandLogo.tsx`, and `EnvUILogo.tsx` are generated assets. Their generators use
root `Icon.tsx` and `MaterialSymbolState.tsx`; keep those shared imports available.
