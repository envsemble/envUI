import { useLayoutEffect, useRef, useState } from 'react';
import { Button, ColorPicker, Dialog, Stack, Text, useTheme } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example, Specimen, SpecimenGrid } from '../Example';
import { colorGroups, colorVariable } from '../../theme/Palette';
import { usePaletteCustomization } from '../../theme/PaletteCustomization';

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
  const { theme } = useTheme();
  const { setValue } = usePaletteCustomization();
  return (
    <Dialog
      title={label}
      className="docs-palette-dialog"
      closeLabel="Done"
      trigger={
        <Button
          variant="secondary"
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
        </Button>
      }
    >
      <ColorPicker
        label={label}
        value={value?.hex ?? '#000000'}
        onValueChange={(color) => setValue(theme, colorVariable(token), color)}
      />
    </Dialog>
  );
}

function ColorPalette() {
  const { theme } = useTheme();
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
        // Translucent colors, such as the neutral fill, are measured as painted on the page.
        context.fillStyle = computedStyle.getPropertyValue('--color-canvas');
        context.fillRect(0, 0, 1, 1);
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
    // Each group is an Example, so the visual baseline captures it; their margins space them.
    <Stack ref={paletteElement} gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <Example key={group} title={group} size="collection">
          <Stack gap={0}>
            {tokens.map(([token, label]) => (
              <div className="docs-palette-row" key={token}>
                <div className="docs-palette-label">
                  <Text as="span" variant="supporting">
                    {label}
                  </Text>
                  <code>--color-{token}</code>
                </div>
                <ColorSwatch token={token} label={label} value={colorValues[token]} />
              </div>
            ))}
          </Stack>
        </Example>
      ))}
    </Stack>
  );
}

function InteractionColors() {
  const states = [
    { label: 'Default', token: '--color-primary-action' },
    { label: 'Hover', token: '--color-primary-action-hover' },
    { label: 'Pressed', token: '--color-primary-action-pressed' },
    { label: 'Disabled', token: '--color-primary-action' },
  ];

  return (
    <Example title="Derived interaction colors" size="collection">
      <Text tone="muted">
        Hover and pressed are derived when the tokens are built: other grades of the same hue, each
        a token of its own, so the contrast gate checks the label on every state.
      </Text>
      <SpecimenGrid size="compact">
        {states.map(({ label, token }) => (
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
              {label === 'Disabled' ? (
                <>
                  <TokenValue token="--state-disabled-opacity" /> opacity
                </>
              ) : (
                <code>{token}</code>
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
