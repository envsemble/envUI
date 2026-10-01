import { useLayoutEffect, useRef, useState } from 'react';
import { Button, GroupedRows, Row } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

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

function ColorPalette() {
  const paletteElement = useRef<HTMLDivElement>(null);
  const [colorValues, setColorValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!paletteElement.current) return;
    const computedStyle = getComputedStyle(paletteElement.current);
    const measuredColors: Record<string, string> = {};
    colorGroups.forEach(([, tokens]) =>
      tokens.forEach(([token]) => {
        measuredColors[token] = computedStyle.getPropertyValue(`--color-${token}`).trim();
      }),
    );
    setColorValues(measuredColors);
  }, []);
  return (
    <div ref={paletteElement} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <section key={group}>
          <h2>{group}</h2>
          {tokens.map(([token, label]) => {
            const hsl = colorValues[token] || '';
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

export function ColorsPreview() {
  return (
    <>
      <ColorPalette />
      <InteractionColors />
    </>
  );
}
