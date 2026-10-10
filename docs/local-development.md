# Develop envUI locally

Use this workflow when the task authorizes co-development in an envUI checkout and a consuming application. Ordinary adoption uses a published version; see [setup](setup.md).

1. Run `npm ci` in envUI.
2. Temporarily run `npm install <path-to-envUI>/packages/ui --install-links=false` from the application, adjusting the path.
3. Run `npm run dev:library` in envUI to build and watch public exports, documentation and packaged skills.
4. For Vite, deduplicate `react`/`react-dom` and exclude `@envsemble/envui` from `optimizeDeps`. Merge these settings with the application's existing configuration.
5. Use ordinary public imports. Before delivery, restore the agreed registry version and lockfile, and validate the packaged consumer path.

```ts
// Merge into the application's existing Vite configuration.
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { exclude: ['@envsemble/envui'] },
});
```

The envUI catalogue reads library source directly and updates with `npm run dev`. External applications use the watched compiled package. Keep the application responsible for its routes, data and deployment configuration.

For library changes, follow [library development](library-development.md). For adoption across existing UI, follow [migration](migration.md).
