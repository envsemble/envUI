import { Suspense, use, useState, type ComponentType, type ReactNode } from 'react';
import { LoadBoundary, reloadModule } from './LoadBoundary';
import { loadOnce } from './LoadOnce';

/** The modules of the parts rendered since takeRenderedParts last ran. */
const rendered = new Set<string>();

/**
 * The modules of the parts rendered since it last ran, by their paths in the site app: the server
 * checks that a page loaded each before it rendered (Server.tsx).
 */
export function takeRenderedParts() {
  const parts = [...rendered];
  rendered.clear();
  return parts;
}

/**
 * A component that loads on its own, for LoadBoundary to show. `module` is the path in the
 * site app of the module `load` imports, such as `src/pages/Changelog.tsx`, and `modules`
 * passes it on to LoadBoundary. `component` renders it, suspending until it has loaded, which
 * `load` starts: once it has, as before a pre-rendered page hydrates, it renders at once (loadOnce).
 * A load that failed stays failed, so `retry` drops it and asks for the module again, as
 * reloadModule does, at that path from the app's root, where Vite serves it in development.
 */
export function lazyPart<M, P extends object>(
  load: () => Promise<M>,
  pick: (module: M) => ComponentType<P>,
  module: string,
) {
  const loads = new Map<string, Promise<ComponentType<P>>>();
  let from = load;
  const part = {
    modules: [module] as const,
    load: () => loadOnce(loads, module, () => from().then(pick)),
    component: function Part(props: P) {
      rendered.add(module);
      const Loaded = use(part.load());
      return <Loaded {...props} />;
    },
    retry() {
      const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
      from = reloadModule(load, module, root);
      loads.clear();
    },
  };
  return part;
}

/**
 * A large part of a page that loads with the page that shows it, such as the token reference or
 * the changelog, in place, with a retry where it fails to load. Until it has loaded, `placeholder`
 * holds its place: its headings, which the page's contents list from the start, over skeletons of
 * what they head.
 */
export function LoadedPart({
  part,
  what,
  placeholder,
}: {
  part: ReturnType<typeof lazyPart<unknown, object>>;
  what: string;
  placeholder: ReactNode;
}) {
  const [, setAttempt] = useState(0);
  const Part = part.component;
  return (
    <LoadBoundary
      what={what}
      modules={part.modules}
      onRetry={() => {
        part.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={placeholder}>
        <Part />
      </Suspense>
    </LoadBoundary>
  );
}
