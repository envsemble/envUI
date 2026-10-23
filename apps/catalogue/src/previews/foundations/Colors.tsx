import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Dialog, Column, Text, useTheme } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';
import { Example } from '../Example';
import { colorGroups, colorVariable } from '../../theme/Palette';
import { usePaletteCustomization } from '../../theme/PaletteCustomization';
import { StateLayers } from './StateLayers';

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
            background: `var(${colorVariable(token)})`,
            color: (value?.lightness ?? 50) > 55 ? 'var(--docs-ink-dark)' : 'var(--docs-ink-light)',
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
        probe.style.color = `var(${colorVariable(token)})`;
        probe.hidden = true;
        paletteElement.current!.append(probe);
        // Translucent colors, such as the neutral fill, are measured as painted on the page.
        context.fillStyle = computedStyle.getPropertyValue('--env-color-bg-page');
        context.fillRect(0, 0, 1, 1);
        context.fillStyle = getComputedStyle(probe).color;
        context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
        probe.remove();
        measuredColors[token] = {
          css: computedStyle.getPropertyValue(colorVariable(token)).trim(),
          hex: '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join(''),
          lightness: ((Math.max(...rgb) + Math.min(...rgb)) / 255) * 50,
        };
      }),
    );
    setColorValues(measuredColors);
  }, [theme, palettes]);
  return (
    // Each group is an Example, so the visual baseline captures it; their margins space them.
    <Column ref={paletteElement} gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <Example key={group} title={group} size="collection">
          <Column gap={0}>
            {tokens.map(([token, label]) => (
              <div className="docs-palette-row" key={label}>
                <div className="docs-palette-label">
                  <Text render={<span />} variant="body-sm">
                    {label}
                  </Text>
                  <code>{colorVariable(token)}</code>
                </div>
                <ColorSwatch token={token} label={label} value={colorValues[token]} />
              </div>
            ))}
          </Column>
        </Example>
      ))}
    </Column>
  );
}

export function ColorsPreview() {
  return (
    <>
      <ColorPalette />
      <StateLayers />
    </>
  );
}
