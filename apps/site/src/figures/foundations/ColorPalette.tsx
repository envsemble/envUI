import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Dialog, Column, Text, useTheme } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';
import { SpecimenFrame } from '../SpecimenFrame';
import { colorGroups, colorVariable } from '../../display/Palette';
import { usePaletteCustomization } from '../../display/PaletteCustomization';
import { useHighContrast } from './ColorFigures';

interface MeasuredColor {
  css: string;
  hex: string;
  ink: string;
  edge: boolean;
}

const inks = [
  ['--docs-ink-dark', [30, 31, 33]],
  ['--docs-ink-light', [255, 255, 255]],
] as const;
const pureInks = [
  ['--docs-ink-black', [0, 0, 0]],
  ['--docs-ink-light', [255, 255, 255]],
] as const;

function relativeLuminance(rgb: readonly number[]) {
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: readonly number[], b: readonly number[]) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

const textContrastTarget = 4.5;
const highTextContrastTarget = 7;
const indistinctFromPageContrast = 1.02;

function inkFor(rgb: readonly number[], targetContrast: number) {
  const best = (choices: typeof inks | typeof pureInks) =>
    choices
      .map(([ink, color]) => ({ ink, ratio: contrast(rgb, color) }))
      .reduce((a, b) => (b.ratio > a.ratio ? b : a));
  const fixed = best(inks);
  if (fixed.ratio >= targetContrast) return fixed.ink;
  const pure = best(pureInks);
  return pure.ratio > fixed.ratio ? pure.ink : fixed.ink;
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
          aria-label={`${value?.css ?? ''} ${label.toLowerCase()}: pick a color`.trim()}
          title="Choose a color"
          data-edge={value?.edge || undefined}
          style={{
            background: `var(${colorVariable(token)})`,
            color: `var(${value?.ink ?? '--docs-ink-light'})`,
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

export function ColorPalette() {
  const { theme, contrast: themeContrast } = useTheme();
  const { palettes } = usePaletteCustomization();
  const paletteElement = useRef<HTMLDivElement>(null);
  const [colorValues, setColorValues] = useState<Record<string, MeasuredColor>>({});
  const highContrast = useHighContrast(themeContrast);
  useLayoutEffect(() => {
    if (!paletteElement.current) return;
    const targetContrast = highContrast ? highTextContrastTarget : textContrastTarget;
    const computedStyle = getComputedStyle(paletteElement.current);
    const context = document
      .createElement('canvas')
      .getContext('2d', { willReadFrequently: true })!;
    const measuredColors: Record<string, MeasuredColor> = {};
    const pageColor = computedStyle.getPropertyValue('--env-color-bg-page');
    context.fillStyle = pageColor;
    context.fillRect(0, 0, 1, 1);
    const page = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    const probes = colorGroups.flatMap(([, tokens]) =>
      tokens.map(([token]) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${colorVariable(token)})`;
        probe.hidden = true;
        paletteElement.current?.append(probe);
        return { token, probe };
      }),
    );
    const paintedOnPage = (color: string) => {
      context.fillStyle = pageColor;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    for (const { token, probe } of probes) {
      const rgb = paintedOnPage(getComputedStyle(probe).color);
      measuredColors[token] = {
        css: computedStyle.getPropertyValue(colorVariable(token)).trim(),
        hex: '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join(''),
        ink: inkFor(rgb, targetContrast),
        edge: contrast(rgb, page) < indistinctFromPageContrast,
      };
    }
    for (const { probe } of probes) probe.remove();
    setColorValues(measuredColors);
  }, [theme, highContrast, palettes]);
  return (
    <Column ref={paletteElement} gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <SpecimenFrame key={group} title={group} size="collection">
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
        </SpecimenFrame>
      ))}
    </Column>
  );
}
