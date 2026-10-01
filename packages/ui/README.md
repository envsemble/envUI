# envUI · @envsemble/envui

envUI is envsemble’s internal component library for React 19 and current browsers. ESM and TypeScript declarations are included; components support server rendering.

## Install

Configure your project `.npmrc`:

```ini
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Use a GitHub classic token with `read:packages` and access to the private package. Keep the token in your shell/user configuration or CI secrets.

```sh
npm install @envsemble/envui react@^19 react-dom@^19
```

## Use

```tsx
import { Theme, Button, IconButton } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import '@envsemble/envui/styles.css';

export function App() {
  return (
    <Theme theme="light">
      <Button startIcon={<Add />}>Create item</Button>
      <IconButton icon={<ChevronRight />} aria-label="Next item" />
    </Theme>
  );
}
```

The stylesheet bundles Inter and scopes styling to explicit light/dark theme boundaries. Your app owns theme preference, routing, data and validation. Dialogs, selects and managed notifications retain their originating theme through portals.

## Icons and assets

Explicit imports from `@envsemble/envui/icons` or individual icon paths support the complete pinned official Material Symbols Rounded catalogue. NavigationItem and Tabs automatically fill selected symbols and outline unselected ones. Standalone symbols accept `filled`; NavigationItem accepts an optional `selectedIcon` for custom React icons. No remote font or SVG loader is needed.

`EnvUILogo` renders the envUI lockup; `BrandLogo` renders the shared envsemble lockup. Both inherit their context color. Raw envUI logos and favicons are exported under `@envsemble/envui/assets/envUI/`; the common envsemble SVG and Inter font remain at `@envsemble/envui/assets/envsemble-lockup-black.svg` and `@envsemble/envui/assets/Inter.woff2`.

## Reference

Read [USAGE.md](USAGE.md) for component composition and state contracts; TypeScript declarations provide the full API. The matching release includes `envUI.html`, which opens offline. See the repository README for local live development and release instructions.

This is private envsemble software. Third-party licenses are in `licenses/` and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
