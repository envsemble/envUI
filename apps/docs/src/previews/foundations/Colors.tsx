import { useLayoutEffect, useRef, useState } from 'react';
import { Dialog, Text, useTheme } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example, Specimen, SpecimenGrid } from '../Example';
import { colorGroups, colorVariable } from '../../theme/Palette';
import { usePaletteCustomization } from '../../theme/PaletteCustomization';
import { ColorPicker } from '../../theme/ColorPicker';

interface MeasuredColor {
  css: string;
  hex: string;
  lightness: number;
}

function ColorSwatch({
  token,
  value,
  label,
}: {
  token: string;
  value?: MeasuredColor;
  label: string;
}) {
  const theme = useTheme();
  const { setValue } = usePaletteCustomization();
  return (
    <Dialog
      title={label}
      className="docs-palette-dialog"
      closeLabel="Done"
      trigger={
        <button
          type="button"
          className="docs-swatch"
          aria-label={`Pick ${label.toLowerCase()} color`}
          title="Choose a color"
          style={{
            background: `var(--color-${token})`,
            color:
              (value?.lightness ?? 50) > 55 ? 'var(--color-canvas-dark)' : 'var(--color-white)',
          }}
        >
          <code>{value?.css ?? ''}</code>
        </button>
      }
    >
      <ColorPicker
        color={value?.hex ?? '#000000'}
        onChange={(color) => setValue(theme, colorVariable(token), color)}
      />
    </Dialog>
  );
}

function ColorPalette() {
  const theme = useTheme();
  const { palettes } = usePaletteCustomization();
  const paletteElement = useRef<HTMLDivElement>(null);
  const [colorValues, setColorValues] = useState<Record<string, MeasuredColor>>({});
  useLayoutEffect(() => {
    if (!paletteElement.current) return;
    const computedStyle = getComputedStyle(paletteElement.current);
    const context = document
      .createElement('canvas')
      .getContext('2d', { willReadFrequently: true })!;
    const measuredColors: Record<string, MeasuredColor> = {};
    colorGroups.forEach(([, tokens]) =>
      tokens.forEach(([token]) => {
        const probe = document.createElement('span');
        probe.style.color = `var(--color-${token})`;
        probe.hidden = true;
        paletteElement.current!.append(probe);
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = getComputedStyle(probe).color;
        context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
        probe.remove();
        measuredColors[token] = {
          css: computedStyle.getPropertyValue(`--color-${token}`).trim(),
          hex: '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join(''),
          lightness: ((Math.max(...rgb) + Math.min(...rgb)) / 255) * 50,
        };
      }),
    );
    setColorValues(measuredColors);
  }, [theme, palettes]);
  return (
    <div ref={paletteElement} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <section key={group}>
          <Text as="h2" variant="page-heading">
            {group}
          </Text>
          {tokens.map(([token, label]) => (
            <div className="docs-palette-row" key={token}>
              <div className="docs-palette-label">
                <span>{label}</span>
                <code>--color-{token}</code>
              </div>
              <ColorSwatch token={token} label={label} value={colorValues[token]} />
            </div>
          ))}
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
