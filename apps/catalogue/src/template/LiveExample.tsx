import { lazy, Suspense, use, useState, type ComponentType, type MouseEvent } from 'react';
import { Disclosure, Stack, Text, Theme, useTheme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import { LoadBoundary, loadModule, reloadModule } from './LoadBoundary';

/**
 * Every example file, rendered live, and its source as text, each loaded with the page that shows
 * it. An example is apps/catalogue/src/examples/<page>/<Name>.tsx with a default-exported
 * component; the page's Markdown names it in an empty ```tsx example=Name``` fence.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../examples/*/*.tsx');
const sourceLoaders = import.meta.glob<string>('../examples/*/*.tsx', {
  query: '?raw',
  import: 'default',
});
const examples = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);
const sources = new Map<string, Promise<string>>();
/** How each source loads: from its loader, or once it failed, from reloadModule. */
const sourceLoads = new Map<string, () => Promise<string>>();

export const examplePath = (page: string, name: string) => `../examples/${page}/${name}.tsx`;

/**
 * The source of an example, loaded once and kept for every later render. A load that fails is kept
 * too, so renders until a retry read the same rejected promise rather than a new one each time,
 * which React would take for a promise it was never given; forgetSource drops it.
 */
function sourceOf(path: string) {
  let source = sources.get(path);
  if (!source) {
    source = loadModule(sourceLoads.get(path) ?? sourceLoaders[path])();
    sources.set(path, source);
  }
  return source;
}

/** Drops an example whose file failed to load, so that its next render loads it again. */
function forgetExample(path: string) {
  examples.set(path, lazy(loadModule(reloadModule(loaders[path], path, import.meta.url))));
}

/** Drops the source of an example that failed to load, so that its next render loads it again. */
function forgetSource(path: string) {
  sources.delete(path);
  sourceLoads.set(
    path,
    reloadModule(sourceLoaders[path], path, import.meta.url, {
      query: 'raw',
      pick: (module) => (module as { default: string }).default,
    }),
  );
}

/** Links in an example keep their semantics without navigating away from the documentation. */
function preventNavigation(event: MouseEvent<HTMLDivElement>) {
  if (event.target instanceof Element && event.target.closest('a[href]')) event.preventDefault();
}

function Source({ path, name }: { path: string; name: string }) {
  const source = use(sourceOf(path));
  return (
    <CodeBlock language="tsx" label={`${name}.tsx`} copyable>
      {source.replace(/\n$/, '')}
    </CodeBlock>
  );
}

/** An example's source in a Code disclosure, with a copy button; a template preview shows it too. */
export function ExampleCode({ page, name }: { page: string; name: string }) {
  // A retry renders the code afresh from its file loaded again.
  const [, setAttempt] = useState(0);
  const path = examplePath(page, name);
  return (
    <Disclosure title="Code" className="docs-live-example-code">
      <LoadBoundary
        what="code"
        modules={[`src/examples/${page}/${name}.tsx?raw`]}
        onRetry={() => {
          forgetSource(path);
          setAttempt((count) => count + 1);
        }}
      >
        <Suspense fallback={<Text role="status">Loading code…</Text>}>
          <Source path={path} name={name} />
        </Suspense>
      </LoadBoundary>
    </Disclosure>
  );
}

/**
 * An example file rendered live, loaded with the page and loaded again on a retry: the body of a
 * live example and of each figure of a page of exchanges.
 */
export function ExampleRender({ page, name }: { page: string; name: string }) {
  // A retry renders the example afresh from its file loaded again, and leaves its code as it is.
  const [, setAttempt] = useState(0);
  const path = examplePath(page, name);
  const Example = examples.get(path);
  if (!Example || !sourceLoaders[path])
    throw new Error(`No example file apps/catalogue/src/examples/${page}/${name}.tsx`);
  return (
    <LoadBoundary
      what="example"
      modules={[`src/examples/${page}/${name}.tsx`]}
      onRetry={() => {
        forgetExample(path);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Text role="status">Loading example…</Text>}>
        {/* The example is looked up among module-level lazy components, not created here. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Example />
      </Suspense>
    </LoadBoundary>
  );
}

/** The handlers that keep an example's links from leaving the documentation. */
export const keepLinksInPlace = {
  onClickCapture: preventNavigation,
  onAuxClickCapture: preventNavigation,
};

/**
 * An example rendered live in the documentation's theme, with its source and a copy button; with
 * `widths`, in a frame of each width, side by side, and with `caption`, a sentence below it.
 */
export function LiveExample({
  page,
  name,
  title,
  caption,
  widths,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  widths?: number[];
}) {
  const theme = useTheme();
  return (
    <Stack gap={3} className="docs-live-example-entry">
      {widths ? (
        <div
          role="group"
          aria-label={`${title} example`}
          className="docs-width-strip"
          // The strip scrolls where its frames don't fit, so the keyboard can scroll it too.
          tabIndex={0}
          data-example={name}
          {...keepLinksInPlace}
        >
          {widths.map((width) => (
            <figure key={width} className="docs-width-frame">
              <Stack
                render={<Theme {...theme} />}
                gap={0}
                className="docs-live-example"
                style={{ inlineSize: `${width}rem` }}
              >
                <ExampleRender page={page} name={name} />
              </Stack>
              <Text render={<figcaption />} variant="caption" emphasis="muted">
                {width} rem wide
              </Text>
            </figure>
          ))}
        </div>
      ) : (
        <Stack
          render={<Theme {...theme} />}
          gap={0}
          role="group"
          aria-label={`${title} example`}
          className="docs-live-example"
          data-example={name}
          {...keepLinksInPlace}
        >
          <ExampleRender page={page} name={name} />
        </Stack>
      )}
      {caption && (
        <Text className="docs-figure-caption" emphasis="muted">
          {caption}
        </Text>
      )}
      <ExampleCode page={page} name={name} />
    </Stack>
  );
}
