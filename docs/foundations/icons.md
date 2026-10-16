---
components:
  - Icon
  - BrandLogo
  - EnvUILogo
aliases:
  - icon
  - Material Symbols
  - symbol
  - logo
---

# Icons & assets

## React usage

```tsx
import { Icon, EnvUILogo, BrandLogo, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import logoUrl from '@envsemble/envui/assets/envUI/envUI-lockup-black.svg';
import faviconUrl from '@envsemble/envui/assets/envUI/envUI-favicon.ico';

<Stack>
  <EnvUILogo />
  <BrandLogo />
  <Home filled label="Home" />
  <Icon viewBox="0 0 24 24" label="Custom mark">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </Icon>
</Stack>;
```

### Props & contracts

| Name                  | Contract                                                                               |
| --------------------- | -------------------------------------------------------------------------------------- |
| Material symbols      | Explicit imports from @envsemble/envui/icons or individual icon paths                  |
| filled                | Standalone symbols choose outline or filled; navigation and tabs manage selection fill |
| Icon label            | Accessible name for a meaningful standalone SVG; omit for decoration                   |
| SVG props             | width, height, viewBox, ref and accessible SVG attributes                              |
| EnvUILogo / BrandLogo | Bundled lockups; inherit context color and accept SVG props                            |
| Raw assets            | Bundler imports from @envsemble/envui/assets/\*; fixed-color SVGs and ICO favicons     |
| Custom icons          | Controls accept React icon content; Icon supplies optional shared SVG defaults         |

## Guidelines

- Use the bundled official Material Symbols Rounded. Symbols load locally; no remote icon font or SVG loader is required.
- Search the offline catalogue by name and copy its exact per-icon import, such as `import { Home } from '@envsemble/envui/icons/Home'`. Import each icon by its subpath rather than from the `@envsemble/envui/icons` barrel, which makes the bundler read the full catalogue for one icon, and makes Vite without `@vitejs/plugin-react` warn about the `'use client'` directive of every icon module.
- Icons inherit their context color. Navigation and tabs choose selected fill automatically.
- Decorative icons stay hidden from assistive technology. Standalone meaningful icons need labels; icon-only controls need accessible action names.
- Use bundled brand assets rather than recreating the marks.
- Raw envUI assets include envUI-lockup-black.svg, envUI-lockup-white.svg, envUI-favicon.ico and envUI-favicon-white.ico in assets/envUI/. The raw envsemble logo is assets/envsemble-lockup-black.svg.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [NavList](../components/nav-list.md)
- [Tabs](../components/tabs.md)
- [Accessibility](../foundations/accessibility.md)
