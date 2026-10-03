import { useLayoutEffect, useRef, useState } from 'react';
import { Text, useTheme } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example, Specimen, SpecimenGrid } from '../Example';

const colorGroups: [string, [string, string][]][] = [
  [
    'Backgrounds',
    [
      ['canvas', 'Page background'],
      ['pane', 'Background panes · grouped content'],
      ['surface-muted', 'Rows, cards, circular buttons & tab rails'],
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
  const theme = useTheme();
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
  }, [theme]);
  return (
    <div ref={paletteElement} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <section key={group}>
          <Text as="h2" variant="page-heading">
            {group}
          </Text>
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
    { label: 'Default', token: '--color-primary-action', shift: null },
    { label: 'Hover', token: '--color-primary-action-hover', shift: '--state-hover-shift' },
    { label: 'Pressed', token: '--color-primary-action-pressed', shift: '--state-pressed-shift' },
    { label: 'Disabled', token: '--color-primary-action', shift: null },
  ];

  return (
    <Example title="Derived interaction colors" size="collection">
      <Text tone="muted">
        Below 50% HSL lightness, add lightness; otherwise subtract it. Clamp to 0–100%.
      </Text>
      <SpecimenGrid size="compact">
        {states.map(({ label, token, shift }) => (
          <Specimen key={label} title={label}>
            <div
              className="docs-color-state"
              aria-hidden="true"
              style={{
                background: `var(${token})`,
                opacity: label === 'Disabled' ? 'var(--state-disabled-opacity)' : undefined,
              }}
            />
            <Text variant="caption">
              {shift ? (
                <>
                  <TokenValue token={shift} /> point shift
                </>
              ) : label === 'Disabled' ? (
                <>
                  <TokenValue token="--state-disabled-opacity" /> opacity
                </>
              ) : (
                'Primary action base color'
              )}
            </Text>
          </Specimen>
        ))}
      </SpecimenGrid>
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
