import { useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  BrandLogo,
  Card,
  GroupedRows,
  Row,
  IconButton,
  NavigationItem,
} from '@envsemble/ui';
import {
  Home,
  Category,
  Search,
  Settings,
  Add,
  Close,
  Check,
  Groups3,
  ChevronRight,
  Devices,
} from '@envsemble/ui/icons';
import { Paired } from './Previews';

export const foundations = [
  {
    id: 'colors',
    title: 'Colors & themes',
    summary: 'Semantic colors and one shared rule for interaction states.',
  },
  {
    id: 'typography',
    title: 'Typography',
    summary: 'Inter with a compact, consistent scale and semantic text colors.',
  },
  {
    id: 'spacing',
    title: 'Spacing & shape',
    summary: 'Relative spacing and familiar geometry across the catalogue.',
  },
  {
    id: 'icons',
    title: 'Icons & assets',
    summary: 'Official Material Symbols Rounded and the envsemble identity.',
  },
  {
    id: 'responsive',
    title: 'Desktop & mobile',
    summary: 'The same components adapt to their content, space and input device.',
  },
  {
    id: 'motion',
    title: 'Motion & accessibility',
    summary: 'Predictable feedback, visible focus and accessible interaction.',
  },
];
const colorGroups: [string, [string, string][]][] = [
  [
    'Backgrounds',
    [
      ['canvas', 'Page background'],
      ['pane', 'Background panes · grouped content'],
      ['surface-muted', 'Rows, cards & circular buttons'],
      ['surface', 'Alternate row fill & secondary buttons'],
    ],
  ],
  [
    'Text & icons',
    [
      ['text-primary', 'Headings & main text · light focus ring'],
      ['text-strong', 'Strong text & primary button fill'],
      ['text-muted', 'Supporting text'],
      ['control-text', 'Secondary labels & circular icons'],
      ['icon', 'Icons'],
      ['text-quiet', 'Captions'],
    ],
  ],
  [
    'Controls',
    [
      ['border-strong', 'Control outlines'],
      ['neutral-fill', 'Neutral toast fill'],
      ['link', 'Links, navigation & radio selection'],
      ['control-blue', 'Enabled toggles & checkboxes'],
      ['accent', 'Important emphasis'],
    ],
  ],
  [
    'Feedback',
    [
      ['destructive-action', 'Delete button & error toast fill'],
      ['toast-success', 'Success toast fill'],
      ['toast-info', 'Info toast fill'],
      ['white', 'Text & icons on colored fills'],
    ],
  ],
  ['Loading', [['skeleton-base', 'Loading placeholders']]],
];

function TokenValue({ token }: { token: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(token).trim());
  }, [token]);
  return <span ref={ref}>{value}</span>;
}
function Palette() {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    const next: Record<string, string> = {};
    colorGroups.forEach(([, tokens]) =>
      tokens.forEach(([token]) => {
        next[token] = style.getPropertyValue(`--color-${token}`).trim();
      }),
    );
    setValues(next);
  }, []);
  return (
    <div ref={ref} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <section key={group}>
          <h2>{group}</h2>
          {tokens.map(([token, label]) => {
            const hsl = values[token] || '';
            const lightness = Number(hsl.match(/([\d.]+)%\s*\)$/)?.[1] ?? 50);
            return (
              <div className="docs-palette-row" key={token}>
                <div className="docs-palette-label">
                  <span>{label}</span>
                  <code>--color-{token}</code>
                </div>
                <div
                  className="docs-swatch"
                  style={{
                    background: `var(--color-${token})`,
                    color: lightness > 55 ? 'var(--color-canvas-dark)' : 'var(--color-white)',
                  }}
                >
                  <code>{hsl}</code>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
const types = [
  ['Page heading', '--type-h1', '--color-text-primary', '1.125 rem · 500'],
  ['Section heading', '--type-h2', '--color-text-primary', '1 rem · 500'],
  ['Body text', '--type-body', '--color-text-primary', '0.9375 rem · 400'],
  ['Supporting text', '--type-body-small', '--color-text-muted', '0.875 rem · 400'],
  ['Caption', '--type-body-small', '--color-text-quiet', '0.875 rem · 400'],
];
const iconList = [
  ['Home', Home],
  ['Category', Category],
  ['Search', Search],
  ['Settings', Settings],
  ['Add', Add],
  ['Close', Close],
  ['Confirm', Check],
  ['People', Groups3],
] as const;

export function FoundationPreview({ id }: { id: string }) {
  return (
    <Paired>
      {() => {
        switch (id) {
          case 'colors':
            return (
              <>
                <Palette />
                <section className="docs-example">
                  <h2>Interaction color rule</h2>
                  <p>
                    Below <TokenValue token="--state-lightness-threshold" />% HSL lightness, add
                    lightness; at or above that threshold, subtract it. Hover shifts{' '}
                    <TokenValue token="--state-hover-shift" /> points and pressed shifts{' '}
                    <TokenValue token="--state-pressed-shift" /> points. Values clamp to 0–100%.
                  </p>
                  <p>
                    Selected navigation mixes <TokenValue token="--state-selected-base-weight" />{' '}
                    link color with its surface. The card action strip mixes{' '}
                    <TokenValue token="--state-card-strip-weight" /> muted surface with its parent
                    surface. Disabled opacity is <TokenValue token="--state-disabled-opacity" />.
                  </p>
                  <div className="docs-actions">
                    <Button>Primary action</Button>
                    <Button variant="important">Important action</Button>
                    <Button variant="outlined">Outlined action</Button>
                  </div>
                </section>
              </>
            );
          case 'typography':
            return (
              <>
                <p className="docs-caption docs-type-intro">
                  Inter Variable · line height 1.4 · regular 400 / medium 500 · ordered by emphasis
                </p>
                <Card tone="pane" className="docs-type-card">
                  <ol className="docs-type-list">
                    {types.map(([title, font, color, meta]) => (
                      <li key={title}>
                        <p
                          className="docs-fox"
                          style={{ font: `var(${font})`, color: `var(${color})` }}
                        >
                          The quick brown fox jumps over the lazy dog.
                        </p>
                        <div className="docs-type-meta">
                          <span>
                            {title} · {meta}
                          </span>
                          <code>
                            <TokenValue token={color} />
                          </code>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </>
            );
          case 'spacing':
            return (
              <>
                <section className="docs-example">
                  <h2>Spacing scale</h2>
                  <div className="docs-spacing-list">
                    {[0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4].map((size, i) => (
                      <div className="docs-measure" key={size}>
                        <code>--space-{i + 1}</code>
                        <span>{size} rem</span>
                        <div
                          className="docs-spacing-bar"
                          style={{ width: `var(--space-${i + 1})` }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
                <section className="docs-example">
                  <h2>Corner scale</h2>
                  <div className="docs-shapes">
                    {[
                      ['1.75rem', 'Panes & outer rows'],
                      ['0.5rem', 'Inner rows & important actions'],
                      ['0.5rem', 'Toasts & chips'],
                      ['100vmax', 'Actions & navigation'],
                      ['100vmax', 'Circular icons'],
                      ['0.25rem', 'Checkboxes'],
                    ].map(([radius, label]) => (
                      <div
                        key={label}
                        className="docs-shape"
                        style={{
                          borderRadius: radius,
                          ...(label === 'Circular icons'
                            ? { width: '6rem', justifySelf: 'center' }
                            : {}),
                        }}
                      >
                        <span>
                          {label}
                          <br />
                          <code>{radius}</code>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="docs-example">
                  <h2>Connected geometry</h2>
                  <GroupedRows>
                    <Row title="Large outer corners" detail="1.75 rem around the whole group" />
                    <Row title="Compact inner corners" detail="0.5 rem corners · 0.125 rem gap" />
                  </GroupedRows>
                </section>
              </>
            );
          case 'icons':
            return (
              <>
                <section className="docs-example">
                  <h2>Rounded symbols</h2>
                  <div className="docs-icon-grid">
                    {iconList.map(([label, Icon]) => (
                      <Card key={label}>
                        <div className="docs-icon-pair">
                          <Icon width="1.5rem" height="1.5rem" />
                          <Icon filled width="1.5rem" height="1.5rem" />
                        </div>
                        <p className="docs-caption">
                          {label}
                          <br />
                          Outline / filled
                        </p>
                      </Card>
                    ))}
                  </div>
                </section>
                <section className="docs-example">
                  <h2>Brand identity</h2>
                  <Card>
                    <BrandLogo className="docs-brand-specimen" />
                  </Card>
                  <p className="docs-caption">
                    Use the bundled envsemble lockup. Theme selection determines the appropriate
                    visible color.
                  </p>
                </section>
                <section className="docs-example">
                  <h2>Icon composition</h2>
                  <div className="docs-actions">
                    <NavigationItem icon={<Home />} selectedIcon={<Home filled />} selected>
                      Home
                    </NavigationItem>
                    <Button startIcon={<Add />}>Create item</Button>
                    <IconButton icon={<ChevronRight />} aria-label="Next item" />
                  </div>
                  <p className="docs-caption">
                    Icons inherit their context color. Decorative icons stay hidden from assistive
                    technology; icon-only actions need an accessible name.
                  </p>
                </section>
              </>
            );
          case 'responsive':
            return (
              <>
                <section className="docs-example">
                  <h2>Desktop composition</h2>
                  <div className="docs-device-frame">
                    <NavigationItem icon={<Home />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <h3>Autumn release</h3>
                      <p>Content wraps naturally as the available space changes.</p>
                      <div className="docs-actions">
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save changes</Button>
                      </div>
                    </Card>
                  </div>
                </section>
                <section className="docs-example">
                  <h2>Compact composition</h2>
                  <div className="docs-device-frame docs-device-mobile">
                    <NavigationItem icon={<Devices />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <h3>Autumn release</h3>
                      <p>Use stacked actions when the content needs more space.</p>
                      <div className="docs-stack docs-mobile-actions">
                        <Button>Save changes</Button>
                        <Button variant="secondary">Cancel</Button>
                      </div>
                    </Card>
                  </div>
                </section>
                <section className="docs-example">
                  <h2>Input-aware sizing</h2>
                  <p>
                    Use relative units and content-driven layout. Standard field and navigation
                    controls are 2.5 rem tall; action buttons start at 2 rem. Coarse pointers use
                    the shared 2.75 rem touch minimum.
                  </p>
                  <p>
                    The application chooses layout breakpoints. Feature cards adapt within their
                    containing block.
                  </p>
                </section>
              </>
            );
          case 'motion':
            return (
              <>
                <section className="docs-example">
                  <h2>Interaction timing</h2>
                  <Card>
                    <div className="docs-facts">
                      <p>
                        Fast transitions{' '}
                        <code>
                          <TokenValue token="--motion-duration-fast" />
                        </code>
                      </p>
                      <p>
                        Medium transitions{' '}
                        <code>
                          <TokenValue token="--motion-duration-medium" />
                        </code>
                      </p>
                      <p>
                        Shared easing{' '}
                        <code>
                          <TokenValue token="--motion-ease" />
                        </code>
                      </p>
                    </div>
                  </Card>
                  <p className="docs-caption">
                    Motion supports a state change. Keep it brief and respect reduced motion.
                  </p>
                </section>
                <section className="docs-example">
                  <h2>Keyboard focus</h2>
                  <div className="docs-actions">
                    <Button className="docs-force-3">Visible focus</Button>
                    <IconButton
                      className="docs-force-3"
                      icon={<ChevronRight />}
                      aria-label="Next item"
                    />
                  </div>
                  <p>
                    Use the shared 0.125 rem focus ring. Keep keyboard order aligned with the
                    visible layout.
                  </p>
                </section>
                <section className="docs-example">
                  <h2>Accessible composition</h2>
                  <p>
                    Give controls visible labels and icon actions accessible names. Link hints and
                    errors to their fields. Preserve native form behavior and disabled states.
                  </p>
                  <p>
                    Dialogs trap and restore focus. Selects support arrow keys and typeahead. Toasts
                    announce feedback, pause timers on hover or focus, and provide persistent
                    recovery actions when needed.
                  </p>
                  <p>
                    Use semantic headings and meaningful links. Validate content and contrast in
                    both supported themes.
                  </p>
                </section>
              </>
            );
          default:
            return null;
        }
      }}
    </Paired>
  );
}
