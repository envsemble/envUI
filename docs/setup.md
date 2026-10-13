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

Import `@envsemble/envui/styles.css` once in the client entry. It includes local Inter and scopes styling to `.env-theme`. Place UI inside `Theme`; a document theme attribute alone does not provide React context. See [colors and themes](foundations/colors.md) for nested boundaries and portals.

### Theme preference

For a whole application, `ThemePreferenceProvider` replaces the fixed `Theme`. It stores the choice, follows the system theme until the user picks one, and themes the document root so the page background, native controls and other libraries' portals match. The root keeps the browser's font size, so 1 rem stays the reader's size (16 px by default), and the document body takes the body type. `ThemeToggle` switches between light and dark. A choice made in another window or tab of the same origin, such as another window of a desktop application, applies at once through the storage event.

```tsx
import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

<ThemePreferenceProvider storageKey="app-theme">
  <ThemeToggle />
</ThemePreferenceProvider>;
```

Add the bootstrap script to the document head so a saved dark theme does not flash light while the application loads. `createThemeBootstrapScript` from `@envsemble/envui/theme-bootstrap` returns the inline script; use the same storage key:

```ts
// vite.config.ts
import { createThemeBootstrapScript } from '@envsemble/envui/theme-bootstrap';

const themeBootstrap = {
  name: 'theme-bootstrap',
  transformIndexHtml: () => [
    {
      tag: 'script',
      children: createThemeBootstrapScript({ storageKey: 'app-theme' }),
      injectTo: 'head-prepend',
    },
  ],
};
```

### Router links

Destinations in envUI render native anchors. Register the router's link once with `LinkProvider` so Button, Link, NavigationItem, Card, DirectionLink and MenuItem destinations navigate on the client. The component receives native anchor props with a string `href`:

```tsx
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';
import { Link } from '@tanstack/react-router';

function RouterLink({ href, ...props }: LinkComponentProps) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />;
}

<LinkProvider component={RouterLink}>{app}</LinkProvider>;
```

The application still decides which destination is selected.

## Public entry points

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/Name` for individual official symbols.
- `@envsemble/envui/content` when the feature needs code or Markdown.
- `@envsemble/envui/rich-text` when the feature needs formatted editing or rendering.
- `@envsemble/envui/assets/*` for raw assets.

The content and rich-text entries depend on Shiki, react-markdown, remark-gfm, marked and Tiptap. They are optional peer dependencies: applications using only the main entry do not install them. An application importing `@envsemble/envui/content` or `@envsemble/envui/rich-text` installs the packages listed under `peerDependencies` in the package manifest, for example `npm install shiki @shikijs/langs @shikijs/themes react-markdown remark-gfm`.

Keep optional content/editor imports with their features. Individual icon imports avoid loading the complete catalogue; see [icons](foundations/icons.md) when adding icons.

## Agent skills

Both short skills ship under `skills/`. Install or copy them into the application's `.agents/skills`, keeping their version aligned with the package. Installing the npm package does not register skills automatically. Component documentation stays under the installed package's `docs/`; copied skills locate that directory before reading relevant pages.

## Related workflows

- [Documentation index](index.md)
- [Migration](migration.md)
- [Local development](local-development.md)
