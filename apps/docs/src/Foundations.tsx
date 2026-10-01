import { useLayoutEffect, useRef, useState } from 'react';
import {
  Text,
  Button,
  BrandLogo,
  EnvUILogo,
  Card,
  Surface,
  GroupedRows,
  Row,
  IconButton,
  NavigationItem,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
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
} from '@envsemble/envui/icons';
import { Paired } from './Previews';
import { Example } from './Example';

const colorGroups: [string, [string, string][]][] = [
  [
    'Backgrounds',
    [
      ['canvas', 'Page background'],
      ['pane', 'Background panes · grouped content & tab rails'],
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
      ['link', 'Links, navigation & radio selection'],
      ['control-blue', 'Enabled toggles & checkboxes'],
      ['accent', 'Important emphasis'],
    ],
  ],
  [
    'Feedback',
    [
      ['neutral-fill', 'Neutral toast fill'],
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

function InteractionColors() {
  const states = [
    { label: 'Default', detail: 'Base color', className: undefined, disabled: false },
    {
      label: 'Hover',
      detail: (
        <>
          <TokenValue token="--state-hover-shift" /> point shift
        </>
      ),
      className: 'docs-force-1',
      disabled: false,
    },
    {
      label: 'Pressed',
      detail: (
        <>
          <TokenValue token="--state-pressed-shift" /> point shift
        </>
      ),
      className: 'docs-force-2',
      disabled: false,
    },
    {
      label: 'Disabled',
      detail: (
        <>
          <TokenValue token="--state-disabled-opacity" /> opacity
        </>
      ),
      className: undefined,
      disabled: true,
    },
  ];

  return (
    <Example title="Interaction states" className="docs-interaction-colors">
      <GroupedRows className="docs-interaction-rows" aria-label="Interaction color states">
        {states.map((state) => (
          <Row
            key={state.label}
            title={state.label}
            detail={state.detail}
            action={
              <Button className={state.className} disabled={state.disabled}>
                Save
              </Button>
            }
          />
        ))}
      </GroupedRows>
    </Example>
  );
}

const types = [
  ['Page heading', 'page-heading', '--color-text-primary', '1.125 rem · 500'],
  ['Section heading', 'section-heading', '--color-text-primary', '1 rem · 500'],
  ['Body text', 'body', '--color-text-primary', '0.9375 rem · 400'],
  ['Supporting text', 'supporting', '--color-text-muted', '0.875 rem · 400'],
  ['Caption', 'caption', '--color-text-quiet', '0.875 rem · 400'],
] as const;
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
                <InteractionColors />
              </>
            );
          case 'typography':
            return (
              <>
                <Surface tone="pane" padding={5}>
                  <ol className="docs-type-list">
                    {types.map(([title, variant, color, meta]) => (
                      <li key={title}>
                        <Text className="docs-fox" variant={variant}>
                          The quick brown fox jumps over the lazy dog.
                        </Text>
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
                </Surface>
                <Example title="Color and semantics">
                  <Stack>
                    <Text as="h3" variant="page-heading">
                      A heading with page emphasis
                    </Text>
                    <Text tone="muted">Body text with supporting color.</Text>
                    <Text tone="quiet">Body text with quiet color.</Text>
                    <Text>
                      Native inline{' '}
                      <Text as="span" tone="muted">
                        supporting context
                      </Text>{' '}
                      keeps its surrounding paragraph semantics.
                    </Text>
                  </Stack>
                </Example>
              </>
            );
          case 'spacing':
            return (
              <>
                <Example title="Spacing scale">
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
                </Example>
                <Example title="Corner scale">
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
                </Example>
              </>
            );
          case 'icons':
            return (
              <>
                <Example title="Rounded symbols">
                  <div className="docs-icon-grid">
                    {iconList.map(([label, Icon]) => (
                      <Card key={label}>
                        <div className="docs-icon-pair">
                          <Icon width="1.5rem" height="1.5rem" />
                          <Icon filled width="1.5rem" height="1.5rem" />
                        </div>
                        <Text variant="caption" className="docs-caption">
                          {label}
                          <br />
                          Outline / filled
                        </Text>
                      </Card>
                    ))}
                  </div>
                </Example>
                <Example title="Brand identity">
                  <div className="docs-icon-grid">
                    <Card>
                      <EnvUILogo className="docs-brand-specimen" />
                      <Text variant="caption" className="docs-caption">
                        envUI
                      </Text>
                    </Card>
                    <Card>
                      <BrandLogo className="docs-brand-specimen" />
                      <Text variant="caption" className="docs-caption">
                        envsemble
                      </Text>
                    </Card>
                  </div>
                  <Text variant="caption" className="docs-caption">
                    Bundled lockups inherit the theme’s text color.
                  </Text>
                </Example>
                <Example title="Icon composition">
                  <ActionGroup>
                    <NavigationItem icon={<Home />} selected>
                      Home
                    </NavigationItem>
                    <Button startIcon={<Add />}>Create item</Button>
                    <IconButton icon={<ChevronRight />} aria-label="Next item" />
                  </ActionGroup>
                  <Text variant="caption" className="docs-caption">
                    Icons inherit their context color. Decorative icons stay hidden from assistive
                    technology; icon-only actions need an accessible name.
                  </Text>
                </Example>
              </>
            );
          case 'responsive':
            return (
              <>
                <Example title="Desktop composition">
                  <Stack className="docs-device-frame">
                    <NavigationItem icon={<Home />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <h3>Autumn release</h3>
                      <p>Content wraps naturally as the available space changes.</p>
                      <ActionGroup>
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save changes</Button>
                      </ActionGroup>
                    </Card>
                  </Stack>
                </Example>
                <Example title="Compact composition">
                  <Stack className="docs-device-frame docs-device-mobile">
                    <NavigationItem icon={<Devices />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <h3>Autumn release</h3>
                      <p>Use stacked actions when the content needs more space.</p>
                      <ActionGroup stacked>
                        <Button>Save changes</Button>
                        <Button variant="secondary">Cancel</Button>
                      </ActionGroup>
                    </Card>
                  </Stack>
                </Example>
              </>
            );
          case 'motion':
            return (
              <>
                <Example title="Interaction timing">
                  <Surface tone="row">
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
                  </Surface>
                  <Text variant="caption" className="docs-caption">
                    Motion supports a state change. Keep it brief and respect reduced motion.
                  </Text>
                </Example>
                <Example title="Keyboard focus">
                  <ActionGroup>
                    <Button className="docs-force-3">Visible focus</Button>
                    <IconButton
                      className="docs-force-3"
                      icon={<ChevronRight />}
                      aria-label="Next item"
                    />
                  </ActionGroup>
                  <p>
                    Use the shared 0.125 rem focus ring. Keep keyboard order aligned with the
                    visible layout.
                  </p>
                </Example>
              </>
            );
          default:
            return null;
        }
      }}
    </Paired>
  );
}
