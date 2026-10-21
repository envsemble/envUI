---
components:
  - Icon
aliases:
  - icon
  - Material Symbols
  - symbol
  - logo
  - BrandLogo
  - EnvUILogo
---

# Icons & assets

## React usage

```tsx
import { Column, Icon } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

<Column gap={4}>
  <Home filled label="Home" />
  <Icon viewBox="0 0 24 24" label="Custom mark">
    <path d="M12 2 22 12 12 22 2 12Z" />
  </Icon>
</Column>;
```

### Props & contracts

| Name             | Contract                                                                               |
| ---------------- | -------------------------------------------------------------------------------------- |
| Material symbols | Explicit imports from @envsemble/envui/icons or individual icon paths                  |
| filled           | Standalone symbols choose outline or filled; navigation and tabs manage selection fill |
| Icon label       | Accessible name for a meaningful standalone SVG; omit for decoration                   |
| SVG props        | width, height, viewBox, ref and accessible SVG attributes                              |
| Custom icons     | Controls accept React icon content; Icon supplies optional shared SVG defaults         |

## Guidelines

- Use the bundled official Material Symbols Rounded. Symbols load locally; no remote icon font or SVG loader is required.
- Search the offline catalogue by name and copy its exact per-icon import, such as `import { Home } from '@envsemble/envui/icons/Home'`. Import each icon by its subpath rather than from the `@envsemble/envui/icons` barrel, which makes the bundler read the full catalogue for one icon, and makes Vite without `@vitejs/plugin-react` warn about the `'use client'` directive of every icon module.
- Icons inherit their context color. Navigation and tabs choose selected fill automatically.
- Decorative icons stay hidden from assistive technology. Standalone meaningful icons need labels; icon-only controls need accessible action names.
- envUI ships no logos: an application keeps its own artwork, and draws it with `Icon` where it should follow the text color.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [NavigationDrawer](../components/navigation-drawer.md)
- [Tabs](../components/tabs.md)
- [Accessibility](../foundations/accessibility.md)
