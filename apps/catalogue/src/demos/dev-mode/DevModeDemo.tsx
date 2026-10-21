import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  Column,
  Disclosure,
  Row,
  SegmentedControl,
  Switch,
  Text,
  Theme,
  useTheme,
} from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import { ViewInAr } from '@envsemble/envui/icons/ViewInAr';
import type { DevModeHandle, LayoutApi, LayoutProblem } from '@envsemble/envui/dev';
import { keepLinksInPlace } from '../../template/LiveExample';
import { DemoApp } from './DemoApp';
import demoSource from './DemoApp.tsx?raw';
// The parts' descriptions the inspector shows, fetched as dev mode opens.
import partsUrl from '../../../../../docs/generated/parts.json?url';

/** The widths the docs check every example at. */
const widths = ['22rem', '40rem', '60rem', '80rem'];

/** The readout, and the skeleton check where this build of dev mode has it. */
type Readout = LayoutApi & {
  skeletonShift?: (root?: Element | string) => LayoutProblem[];
};

type Call = 'describe' | 'check' | 'at' | 'skeletonShift';

/** Each call as the page makes it, with the demo's root for `root`, and what it shows. */
const calls: Record<
  Call,
  { label: string; code: string; run: (layout: Readout, root: HTMLElement) => string }
> = {
  describe: {
    label: 'describe()',
    code: 'envui.layout.describe({ root })',
    run: (layout, root) => layout.describe({ root }),
  },
  check: {
    label: 'check()',
    code: 'envui.layout.check({ root })',
    run: (layout, root) => JSON.stringify(layout.check({ root }), null, 2),
  },
  at: {
    label: 'at()',
    code: [
      'envui.layout',
      "  .at(['22rem', '40rem', '60rem', '80rem'], { root })",
      // eslint-disable-next-line no-template-curly-in-string -- the code as the reader runs it.
      '  .flatMap(({ width, problems }) => problems.map((problem) => `${width}: ${problem.message}`))',
      "  .join('\\n')",
    ].join('\n'),
    run: (layout, root) =>
      layout
        .at(widths, { root })
        .flatMap(({ width, problems }) => problems.map((problem) => `${width}: ${problem.message}`))
        .join('\n'),
  },
  skeletonShift: {
    label: 'skeletonShift()',
    code: 'envui.layout.skeletonShift(root)',
    run: (layout, root) => JSON.stringify(layout.skeletonShift?.(root) ?? [], null, 2),
  },
};

/**
 * Dev mode on a small application, for the dev mode page: the real `@envsemble/envui/dev`, loaded
 * with this module only and scoped to the application's root, so its 3D view, inspector and
 * readout describe the application rather than the page around it. It is uninstalled as the page
 * goes.
 */
export function DevModeDemo() {
  const theme = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const [devMode, setDevMode] = useState<DevModeHandle | null>(null);
  const [failed, setFailed] = useState(false);
  const [fixedColumns, setFixedColumns] = useState(true);
  const [call, setCall] = useState<Call>('at');
  const [output, setOutput] = useState('');

  useEffect(() => {
    let handle: DevModeHandle | undefined;
    let gone = false;
    import('@envsemble/envui/dev')
      .then(({ installDevMode }) => {
        if (gone || !root.current) return;
        handle = installDevMode({ root: root.current, button: false, parts: partsUrl });
        setDevMode(handle);
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => {
      gone = true;
      handle?.uninstall();
    };
  }, []);

  const layout = devMode?.layout as Readout | undefined;
  const read = useCallback(() => {
    if (!layout || !root.current) return;
    setOutput(calls[call].run(layout, root.current));
  }, [layout, call]);

  // Read again after every change, and as the application resizes with the window.
  useLayoutEffect(read, [read, fixedColumns, theme]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [read]);

  const choices = (Object.keys(calls) as Call[])
    .filter((name) => name !== 'skeletonShift' || layout?.skeletonShift)
    .map((name) => ({ value: name, label: calls[name].label }));

  return (
    <Column gap={7} className="docs-dev-mode-demo">
      <Column gap={3}>
        <Column
          render={<Theme {...theme} />}
          container="env-window"
          gap={0}
          role="group"
          aria-label="Example application"
          className="docs-live-example"
          {...keepLinksInPlace}
        >
          <div ref={root} data-dev-mode-demo="">
            <DemoApp fixedColumns={fixedColumns} />
          </div>
        </Column>
        <Row gap={4} align="center" wrap>
          <Button
            variant="primary"
            startIcon={<ViewInAr />}
            disabled={!devMode}
            onClick={() => devMode?.open()}
          >
            Open dev mode
          </Button>
          <Switch
            label="Three fixed columns"
            checked={fixedColumns}
            onCheckedChange={setFixedColumns}
          />
        </Row>
        {failed && (
          <Text role="alert" emphasis="muted">
            Dev mode failed to load. Reload the page to try again.
          </Text>
        )}
        <Disclosure title="Code" className="docs-live-example-code">
          <CodeBlock language="tsx" label="DemoApp.tsx" copyable>
            {demoSource.replace(/\n$/, '')}
          </CodeBlock>
        </Disclosure>
      </Column>
      <Column gap={3}>
        <SegmentedControl
          aria-label="Readout"
          value={call}
          onValueChange={(value) => setCall(value as Call)}
          items={choices}
        />
        <CodeBlock language="text" label="Readout" copyable wrap>
          {`> ${calls[call].code}

${devMode ? output : 'Loading dev mode…'}`}
        </CodeBlock>
      </Column>
    </Column>
  );
}
