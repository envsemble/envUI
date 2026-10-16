---
components:
  - EnvUIProvider
  - useLocale
  - LinkProvider
  - createThemeBootstrapScript
  - Theme
  - ThemePreferenceProvider
  - ThemeToggle
  - useTheme
  - useThemePreference
exportAliases:
  EnvUIProvider:
    - i18n
    - internationalization
    - localization
    - translations
    - messages
    - locale
    - right to left
    - RTL
  useLocale:
    - current locale
  ThemeToggle:
    - theme switcher
    - dark mode toggle
    - dark mode switch
    - light and dark switch
    - switch between light and dark
  ThemePreferenceProvider:
    - theme preference
    - persisted theme
  LinkProvider:
    - router link
    - client-side navigation
---

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

Import `@envsemble/envui/styles.css` once in the client entry. It includes local Inter and scopes styling to `.env-theme`. Every rule of it is in a cascade layer of `env` (`env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`), so the application's own CSS outside cascade layers overrides envUI's whatever its specificity, without `!important`. An application that uses cascade layers of its own declares their order once, with `env` first, such as `@layer env, base, app;`, so its layers win too. Place UI inside `Theme`; a document theme attribute alone does not provide React context. See [colors and themes](foundations/colors.md) for nested boundaries, portals and high contrast.

### Theme preference

For a whole application, `ThemePreferenceProvider` replaces the fixed `Theme`. It stores the choice, follows the system theme until the user picks one, and themes the document root so the page background, native controls and other libraries' portals match. Every `<meta name="theme-color">` in the page takes the canvas color of the theme in use once the application has started, so the browser's own interface, such as a mobile address bar, matches too; until then, one tag per system color scheme with a `media` condition keeps the first paint close. The root keeps the browser's font size, so 1 rem stays the reader's size (16 px by default), and the document body takes envUI's body type from its base layer. An application's own `body` rule styles the body element and the text that inherits from it outside envUI's themed boundaries; paragraphs and headings take envUI's type anywhere under a themed root. Inside the boundaries, envUI's type applies: in the provider's boundary around the application, in a `Theme` and in envUI's popups, such as dialogs, menus, tooltips and notifications. Its line height is unitless, 1.4 or `--env-line-height-body`, so text in another size keeps lines in proportion. To change the typeface, the size or the line height there, set envUI's font tokens, such as `--env-font-family`, `--env-font-size-body` and `--env-line-height-body`, for `.env-theme` in a style sheet that loads after envUI's, rather than a `body` rule. A rule in a cascade layer the application declares before `env` loses to envUI's, whatever its specificity. `ThemeToggle` switches between light and dark. A choice made in another window or tab of the same origin, such as another window of a desktop application, applies at once through the storage event. The provider's `contrast`, `high` or `standard`, sets the application's contrast as on `Theme`, on its boundary and the document root. Left out, the provider takes the contrast of a `Theme` around it, and outside any it follows the system's `prefers-contrast: more`, as `system` does; it then leaves a `data-env-contrast` the page set on the root itself in place, and gives its boundary that contrast, so the application matches the page. `scale` works the same way: left out, the provider takes the scale of a `Theme` around it, and outside any a `data-env-scale` the page set on the root, or else comfortable. It tells the page's contrast from its own by `data-env-contrast-source`, which it writes beside its contrast with the value written, such as `envui:high`. A page that writes the same value over envUI's leaves that marker matching, so the provider can't tell the two apart and removes the page's contrast as its own; a page that keeps a contrast of its own on the root also removes `data-env-contrast-source`. The provider stores only the color scheme. When it unmounts, or `applyToDocument` turns false, it removes the contrast and the scale it wrote on the root, unless the page has written over them or another provider holds them. One provider per document themes the root: another, nested in it or beside it, such as for a section with a preference of its own, passes `applyToDocument={false}`. In development, envUI reports two providers that both apply to the document.

```tsx
import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

<ThemePreferenceProvider storageKey="app-theme">
  <ThemeToggle />
</ThemePreferenceProvider>;
```

Add the bootstrap script to the document head so a saved dark theme does not flash light while the application loads. `createThemeBootstrapScript` from `@envsemble/envui/theme-bootstrap` returns the inline script; use the same storage key as the provider:

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

An application that renders `<html>` with React, as server-rendering frameworks do, adds `suppressHydrationWarning` to that element: the script sets the root's class, `data-env-theme`, `style` and, with a contrast, `data-env-contrast` before React hydrates, so they differ from the server's markup. The prop silences only the attributes of `<html>` itself, not of its children.

```tsx
<html lang="en" suppressHydrationWarning>
```

When the application's contrast is fixed, such as an application that is always high contrast, pass it to both: `contrast: 'high'` to the bootstrap script as well as `contrast="high"` to the provider, so the root has it from the first paint. The script marks what it writes with `data-env-contrast-source`, such as `envui:high`, as the provider marks the contrast it writes, and a provider treats a marked contrast as its own: once the application starts, the provider's contrast replaces it, and a provider at `system` removes it, also when it mounts in place of another, such as a provider keyed by the signed-in user. The marker holds the value written, so a contrast the application writes over envUI's stays. So when the contrast is a setting that the application stores, the bootstrap script, built once, cannot know it: leave `contrast` out of the script, and the provider applies the stored setting when the application starts.

### Router links

Destinations in envUI render native anchors. Register the router's link once with `LinkProvider` so Button, Link, NavList.Item, Card, Pager links and Menu.Item destinations navigate on the client. The component receives native anchor props with a string `href`:

```tsx
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';
import { Link } from '@tanstack/react-router';

function RouterLink({ href, ...props }: LinkComponentProps) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />;
}

<LinkProvider component={RouterLink}>{app}</LinkProvider>;
```

The application still decides which destination is selected.

## Locale, strings and direction

envUI works without setup in English, in the runtime's locale and in each element's text direction. An application that translates or formats for its people wraps itself, or a region, in `EnvUIProvider`:

```tsx
import { EnvUIProvider } from '@envsemble/envui';

<EnvUIProvider
  locale="de-CH"
  messages={{
    common: { close: 'Schließen', loading: 'Wird geladen' },
    toast: { hidden: ({ count }) => t('notifications.hidden', { count }) },
  }}
  dir="ltr"
>
  {app}
</EnvUIProvider>;
```

- `locale` is the BCP 47 tag envUI formats numbers, dates and relative times in. Without it, the server and the first client render use `en-GB`, so their markup matches, and the browser's locale applies once the page has hydrated. `useLocale()` returns the provider's locale, to format in step with envUI.
- `messages` overrides envUI's built-in strings, per namespace, one per component family, such as `common`, `toast` or `pagination`. A message is a string, or a function of the values it names, so any translation library plugs in. Nested providers merge per namespace, the inner winning, and a component's own label prop, such as `closeLabel`, wins over both. `defaultMessages` from `@envsemble/envui/messages` lists every namespace and key with its English default, for extracting them.
- `dir` sets the direction for keyboard and placement logic, such as which arrow key moves forward. Without it, components read the direction at their element. It doesn't set the `dir` attribute: set that on the page or the region.

The provider is a client component. A component with a built-in string reads it in a client module, so a server component renders it as before.

## React Server Components

envUI works in an application built on React Server Components. Server and client components import from the same entry points:

- Components that keep state, run effects, read context or take part in Base UI's interactions are client components. Their modules start with `'use client'`, as Base UI's parts do, so a server component renders them as client references and the bundler sends them to the browser. They include `Theme`, `Dialog`, `Menu.Root` and its parts, `Table.Root`, the form fields, and icons that follow a selection's fill.
- Components that only lay out markup, such as `Card`, `Badge`, `Text`, `Button`, `Alert`, `List.Item` and `Stat.Root`, render on the server and send no code of their own to the browser.
- The entry points carry no directive, so `Menu.Item` from `@envsemble/envui` in a server component is the client part, reached through its namespace.
- Plain functions, such as `createThemeBootstrapScript` and `formatRelativeTime`, run on the server.

What a server component passes to a client component must be serializable: strings, numbers, elements and plain objects, but no functions. Event handlers such as `onClick` or `onOpenChange`, render props and formatting callbacks belong in a client component of the application's own, marked `'use client'`, that renders the envUI part. Hooks such as `useTheme` and `useToast` work in client components only. Bundlers without server components ignore the directive.

## Public entry points

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/Name` for individual official symbols.
- `@envsemble/envui/content` when the feature needs code or Markdown.
- `@envsemble/envui/diff` when the feature shows code diffs.
- `@envsemble/envui/rich-text` when the feature needs formatted editing or rendering.
- `@envsemble/envui/messages` for `defaultMessages`, envUI's English strings by namespace, for applications that extract or translate them.
- `@envsemble/envui/assets/*` for raw assets.

The content, rich-text and diff entries depend on Shiki, the Pierre code themes, react-markdown, remark-gfm, marked, Tiptap and Diffs. They are optional peer dependencies: applications using only the main entry do not install them. An application importing `@envsemble/envui/content`, `@envsemble/envui/rich-text` or `@envsemble/envui/diff` installs the packages listed under `peerDependencies` in the package manifest, for example `npm install shiki @shikijs/langs @pierre/theme react-markdown remark-gfm`, and `@pierre/diffs` for the diff entry.

Keep optional content/editor imports with their features. Import icons by subpath, one module each, such as `import { Add } from '@envsemble/envui/icons/Add'`, rather than from the `@envsemble/envui/icons` barrel: the barrel re-exports every symbol, so a bundler reads the whole catalogue for one icon, and Vite without `@vitejs/plugin-react` prints a warning about the `'use client'` directive of each of its thousands of modules (2,734 for one icon). See [icons](foundations/icons.md) when adding icons.

### Bundle size

The modules have no side effects, so a bundler keeps only what the application uses. Namespaces are where bundlers differ. Rolldown, which Vite uses, keeps only the parts the application renders. esbuild keeps every part of a namespace it uses, because it does not tree-shake a namespace that the entry point re-exports; no other export shape of the entry point changes that, and the parts are already pure. The cost is at most the namespace's own size. Measured with esbuild 0.28 and Vite 8 on envUI 1.0, minified, envUI's own code only (React, Base UI and the other dependencies counted apart):

| Application renders                    | esbuild | Vite (Rolldown) |
| -------------------------------------- | ------: | --------------: |
| `Table.Cell` alone                     |  9.1 KB |          1.4 KB |
| `Table.Root`, `Body`, `Row` and `Cell` |  9.2 KB |          5.3 KB |
| `Menu.Item` alone                      |  7.7 KB |          3.8 KB |
| `Menu.Root` with a `Menu.Item`         |  9.2 KB |          7.4 KB |
| `Stat.Root`                            |  3.3 KB |          3.5 KB |
| `NavList.Item`                         |  3.8 KB |          4.2 KB |
| `Pager.Next`                           |  1.5 KB |          1.6 KB |
| `Badge`, which is no namespace's part  |  0.6 KB |          0.9 KB |

Gzipped, `Table.Cell` alone is 3.7 KB with esbuild and 0.6 KB with Vite.

## Coding agents

Run `npx --no envui agents` once to put the envUI index into the project's `AGENTS.md`, and register `node node_modules/@envsemble/envui/bin/envui.mjs mcp` as an MCP server in the project. The three skills ship under `skills/`; copy them into the project, keeping their version aligned with the package. Installing the npm package registers none of these by itself. [For agents](agent-tooling.md) describes them.

## Related workflows

- [Documentation index](index.md)
- [For agents](agent-tooling.md)
- [Migration](migration.md)
- [Local development](local-development.md)
