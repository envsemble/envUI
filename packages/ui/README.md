# @envsemble/ui

Internal envsemble components for React 19 and current browsers. ESM and TypeScript declarations are included; components support server rendering.

## Install

Configure your project `.npmrc`:

```ini
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Use a GitHub classic token with `read:packages` and access to the private package. Keep the token in your shell/user configuration or CI secrets.

```sh
npm install @envsemble/ui react@^19 react-dom@^19
```

## Use

```tsx
import { Theme, Button, IconButton } from '@envsemble/ui';
import { Add } from '@envsemble/ui/icons/Add';
import { ChevronRight } from '@envsemble/ui/icons/ChevronRight';
import '@envsemble/ui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
    <IconButton icon={<ChevronRight />} aria-label="Next item" />
  </Theme>;
}
```

The stylesheet bundles Inter and scopes styling to explicit light/dark theme boundaries. Your app owns theme preference, routing, data and validation. Dialogs, selects and managed notifications retain their originating theme through portals.

## Icons and assets

Explicit imports from `@envsemble/ui/icons` or individual icon paths support the complete pinned official Material Symbols Rounded catalogue. Set `filled` for selected states; icon slots accept custom React content. No remote font or SVG loader is needed.

`BrandLogo` renders the common envsemble lockup. Raw assets are exported at `@envsemble/ui/assets/envsemble-lockup-black.svg` and `@envsemble/ui/assets/Inter.woff2` for bundlers that support asset imports.

## Reference

Read [USAGE.md](USAGE.md) for component composition and state contracts; TypeScript declarations provide the full API. The matching release includes `DesignSystemGallery.html`, which opens offline. See the repository README for local live development and release instructions.

This is private envsemble software. Third-party licenses are in `licenses/` and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
