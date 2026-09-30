# Local development

## Documentation consumer

```sh
npm ci
npm run dev
```

The documentation resolves the package's public `envsemble-source` development condition. Edits to exported components and CSS update through Vite without publishing or changing dependency versions. React Fast Refresh keeps compatible component state; adding/removing exports, changing hook signatures or dependency/configuration changes can require a reload or server restart.

## Future external React product

For a Vite product alongside a local checkout:

1. Install React 19 in the product and `npm ci` in the library checkout.
2. Temporarily install the local package: `npm install ../design-system/packages/ui --install-links=false` (adjust the path).
3. Run `npm run dev:library` in the library checkout. It rebuilds the package's normal public exports as source changes.
4. In the product's Vite config, use `resolve: { dedupe: ['react', 'react-dom'] }` and `optimizeDeps: { exclude: ['@envsemble/ui'] }` so the linked package is watched and the product supplies React.
5. Import the normal `@envsemble/ui` API and `@envsemble/ui/styles.css`; do not import private source files.

This mode needs no package publication/version bump per edit. The documentation has an additional source condition for faster refresh; external consumers can use the portable watched compiled output.

The temporary local dependency is a development choice. Before delivering a product, restore the intended registry version with `npm install @envsemble/ui@<version>` and commit its normal package manifest/lockfile. This task does not connect existing products.

## Add a shared component

Add a PascalCase source file with a named export under `packages/ui/src`, use the existing scoped tokens/primitives, and export it from `src/index.ts`. Add its concise reference to `apps/docs/src/Reference.ts` and a public-API preview in `Previews.tsx`. Add acceptance coverage, then run `npm run verify`.

The component reference also generates packaged `USAGE.md`; edit the maintained reference rather than the generated guide. Custom application icons can be passed to icon slots. To refresh the official catalogue intentionally, pin a Google commit with `npm run icons:sync -- --revision <commit>`, regenerate and review the manifest/license changes.
