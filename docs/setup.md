# Install the private package

Requires React and React DOM 19. Select the intended envUI release and use the documentation shipped with that version.

## Registry access

```ini
# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Local developers need a classic GitHub token with `read:packages` and package access. GitHub Actions can use the consuming repository's `GITHUB_TOKEN` after package Read access is granted, with `packages: read`. Supply `NODE_AUTH_TOKEN` through the environment; keep real tokens out of committed files.

## Install a release

```sh
npm install --save-exact @envsemble/envui@<version>
```

## Connect styles and theme

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

Import `@envsemble/envui/styles.css` once in the client entry. It includes local Inter and scopes styling to `.env-theme`. Place UI inside `Theme`; a document theme attribute alone does not provide React context. The application supplies `light` or `dark` and owns preference, first-render initialization and persistence. See [colors and themes](foundations/colors.md) for nested boundaries and portals.

## Public entry points

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/Name` for individual official symbols.
- `@envsemble/envui/content` when the feature needs code or Markdown.
- `@envsemble/envui/rich-text` when the feature needs formatted editing or rendering.
- `@envsemble/envui/assets/*` for raw assets.

Keep optional content/editor imports with their features. Individual icon imports avoid loading the complete catalogue; see [icons](foundations/icons.md) when adding icons.

## Agent skills

Both short skills ship under `skills/`. Install or copy them into the application's `.agents/skills`, keeping their version aligned with the package. Installing the npm package does not register skills automatically. Component documentation stays under the installed package's `docs/`; copied skills locate that directory before reading relevant pages.

## Related workflows

- [Documentation index](index.md)
- [Migration](migration.md)
- [Local development](local-development.md)
