import { Suspense, use, useState, type ComponentType, type ReactNode } from 'react';
import { LoadBoundary, reloadModule } from './LoadBoundary';
import { loadOnce } from './LoadOnce';

const renderedPartModules = new Set<string>();

export function takeRenderedParts() {
  const parts = [...renderedPartModules];
  renderedPartModules.clear();
  return parts;
}

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
      renderedPartModules.add(module);
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
