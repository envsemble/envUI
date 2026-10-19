# Workspace app

A single-page React 19 and TypeScript app built with Vite. It manages projects and the people in a workspace.

## Commands

- `npm run dev` starts the dev server.
- `npm run typecheck` type-checks the project.
- `npm run build` type-checks and builds for production.

## Structure

- `src/main.tsx` mounts the app.
- `src/App.tsx` is the app frame; pages live in `src/pages/`.
- `src/components/` holds the app's shared components; `src/components/index.ts` exports them.
- `src/api.ts` is the (mocked) backend; `src/data/` holds sample data.
- Styles are in `src/app.css` and `src/components/components.css`.

## UI

The UI uses `@envsemble/envui`.
