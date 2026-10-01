# envUI

Private React 19 component library, with a separate documentation app that consumes its public API. Existing product integration is deferred.

## Develop

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8770. Library components and CSS update live through the workspace connection. See [local development](docs/LocalDevelopment.md) for adding components and temporarily connecting a future product.

## Build and share

```sh
npm run build
```

`packages/ui/dist` contains the ESM library, declarations, scoped CSS and assets. Send `dist/envUI.html` on its own: runtime, font, icons and licenses are embedded, and hash navigation works offline.

## Consume

```tsx
import { Theme, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import '@envsemble/envui/styles.css';

export function App() {
  return (
    <Theme theme="light">
      <Button startIcon={<Add />}>Create item</Button>
    </Theme>
  );
}
```

See the [package setup](packages/ui/README.md), generated [agent usage guide](packages/ui/USAGE.md) and [private release workflow](docs/Releases.md).

## Ownership

| Source                              | Purpose                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `packages/ui/src/styles/Tokens.css` | Central HSL base palette, interaction rule, typography and spacing                     |
| `packages/ui/src`                   | Components grouped by purpose; public exports stay in `index.ts`                       |
| `packages/ui/src/icons`             | Generated wrappers from pinned official Google SVGs                                    |
| `assets/brand/envUI`                | Official envUI logos and favicons; build generates EnvUILogo and bundles the originals |
| `apps/docs/src/pages`               | Overview, component catalogue and Getting started                                      |
| `apps/docs/src/previews`            | Component/foundation demonstrations and paired specimen state                          |
| `apps/docs/src/reference`           | Maintained design guidance, usage examples and API contracts                           |
| `apps/docs/src/Reference.ts`        | Stable entry for shared guidance and generated package `USAGE.md`                      |
| `apps/docs/src/Documentation.ts`    | Topic routes, reading order and legacy link aliases                                    |
| `tests`                             | Packed consumer, SSR, browser and offline acceptance                                   |

Keep palette entries as base colors. Hover and pressed lightness use one color-based rule from Tokens.css, in both themes. Use regular/medium typography, relative units, shared spacing and existing rounding. Purple remains rare emphasis; everyday actions are neutral. The application owns routing, validation and theme preference.

Reusable UI belongs in the library. Documentation uses its public components for controls, surfaces, typography and composition. Documentation owns routes, paired preview state, page grids, token swatches, code/prop tables and artificial interaction specimens. Extend the shared API before adding component styling overrides to the documentation.

See the [library source map](packages/ui/src/README.md) and [documentation source map](apps/docs/README.md) before adding a component or topic. Keep implementation in its existing family; add shared helpers only when they serve multiple components.

Surface owns background geometry; Stack and ActionGroup own layout. Card composes Surface and Stack, and specialized cards build on Card. Compose through `render` when these layers should share a single root element.

## Verify

```sh
npx playwright install chromium firefox webkit
npm run verify
```

CI runs the same gates plus Betterleaks. The browser checks cover all three engines, native form behavior, portal themes, notification lifecycle, linked previews and the standalone HTML with networking blocked. Package checks install a tarball in an isolated consumer and validate types, SSR, assets and unused-icon exclusion.
