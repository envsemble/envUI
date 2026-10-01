import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
import { Example, SpecimenGrid } from './Example';

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

function TextSpecimen({ sample, children }: { sample: ReactNode; children: ReactNode }) {
  return (
    <li>
      {sample}
      <Stack gap={1} className="docs-type-meta">
        {children}
      </Stack>
    </li>
  );
}

function TypographyPreview() {
  return (
    <>
      <Example title="Text variants" size="wide">
        <Card tone="pane">
          <ol className="docs-type-list">
            {types.map(([title, variant, color, meta]) => (
              <TextSpecimen
                key={variant}
                sample={<Text variant={variant}>The quick brown fox jumps over the lazy dog.</Text>}
              >
                <Text as="span" variant="caption">
                  {title} · {meta}
                </Text>
                <Text as="span" variant="caption">
                  <code>
                    <TokenValue token={color} />
                  </code>
                </Text>
              </TextSpecimen>
            ))}
          </ol>
        </Card>
      </Example>
      <Example title="Text component" size="wide">
        <Text variant="supporting">
          variant sets the style, tone sets the color, and as chooses the HTML element. Stack
          supplies spacing.
        </Text>
        <Card tone="pane">
          <ol className="docs-type-list">
            <TextSpecimen
              sample={
                <Text as="h3" variant="page-heading">
                  Project overview
                </Text>
              }
            >
              <Text as="span" variant="caption">
                <code>{'<Text as="h3" variant="page-heading">'}</code>
              </Text>
            </TextSpecimen>
            <TextSpecimen sample={<Text tone="muted">Shared project context.</Text>}>
              <Text as="span" variant="caption">
                <code>{'<Text tone="muted">'}</code>
              </Text>
            </TextSpecimen>
            <TextSpecimen sample={<Text tone="quiet">Updated today.</Text>}>
              <Text as="span" variant="caption">
                <code>{'<Text tone="quiet">'}</code>
              </Text>
            </TextSpecimen>
            <TextSpecimen
              sample={
                <Text>
                  Project status:{' '}
                  <Text as="span" tone="muted">
                    Draft
                  </Text>
                </Text>
              }
            >
              <Text as="span" variant="caption">
                <code>{'<Text as="span" tone="muted">'}</code>
              </Text>
            </TextSpecimen>
          </ol>
        </Card>
      </Example>
    </>
  );
}

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
            return <TypographyPreview />;
          case 'spacing':
            return (
              <>
                <Example title="Spacing scale" size="compact">
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
                <Example title="Corner scale" size="wide">
                  <SpecimenGrid size="compact">
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
                  </SpecimenGrid>
                </Example>
              </>
            );
          case 'icons':
            return (
              <>
                <Example title="Rounded symbols" size="collection">
                  <SpecimenGrid size="compact">
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
                  </SpecimenGrid>
                </Example>
                <Example title="Brand identity">
                  <SpecimenGrid size="compact">
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
                  </SpecimenGrid>
                  <Text variant="caption" className="docs-caption">
                    Bundled lockups inherit the theme’s text color.
                  </Text>
                </Example>
              </>
            );
          case 'responsive':
            return (
              <>
                <Example title="Regular composition">
                  <Stack>
                    <NavigationItem icon={<Home />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <Text as="h3" variant="section-heading">
                        Autumn release
                      </Text>
                      <Text>Content wraps naturally as the available space changes.</Text>
                      <ActionGroup>
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save changes</Button>
                      </ActionGroup>
                    </Card>
                  </Stack>
                </Example>
                <Example title="Compact composition" size="compact">
                  <Stack className="docs-narrow-actions">
                    <NavigationItem icon={<Devices />} selected>
                      Workspace
                    </NavigationItem>
                    <Card>
                      <Text as="h3" variant="section-heading">
                        Autumn release
                      </Text>
                      <Text>Use stacked actions when the content needs more space.</Text>
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
                      <Text variant="supporting">
                        Fast transitions{' '}
                        <code>
                          <TokenValue token="--motion-duration-fast" />
                        </code>
                      </Text>
                      <Text variant="supporting">
                        Medium transitions{' '}
                        <code>
                          <TokenValue token="--motion-duration-medium" />
                        </code>
                      </Text>
                      <Text variant="supporting">
                        Shared easing{' '}
                        <code>
                          <TokenValue token="--motion-ease" />
                        </code>
                      </Text>
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
                  <Text>
                    Use the shared 0.125 rem focus ring. Keep keyboard order aligned with the
                    visible layout.
                  </Text>
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
