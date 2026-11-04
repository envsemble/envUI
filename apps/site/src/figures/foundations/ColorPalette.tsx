import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Dialog, Column, Text, useTheme } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';
import { Example } from '../Example';
import { colorGroups, colorVariable } from '../../theme/Palette';
import { usePaletteCustomization } from '../../theme/PaletteCustomization';

interface MeasuredColor {
  css: string;
  hex: string;
  /** The label's ink: the variable of the one that reads best on the color. */
  ink: string;
  /** Whether the color is so near the page's that the swatch needs an edge to show. */
  edge: boolean;
}

/** The fixed inks of a swatch's label, in docs-swatch, and the pure ones for mid-tones. */
const inks = [
  ['--docs-ink-dark', [30, 31, 33]],
  ['--docs-ink-light', [255, 255, 255]],
] as const;
const pureInks = [
  ['--docs-ink-black', [0, 0, 0]],
  ['--docs-ink-light', [255, 255, 255]],
] as const;

/** WCAG relative luminance of an sRGB color. */
function luminance(rgb: readonly number[]) {
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: readonly number[], b: readonly number[]) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

/**
 * The ink that reads best on a color: the fixed dark or light one, or, on a mid-tone where neither
 * reaches the text contrast the theme promises (4.5:1, or 7:1 at high contrast), pure black or
 * white when that reads better.
 */
function inkFor(rgb: readonly number[], target: number) {
  const best = (choices: typeof inks | typeof pureInks) =>
    choices
      .map(([ink, color]) => ({ ink, ratio: contrast(rgb, color) }))
      .reduce((a, b) => (b.ratio > a.ratio ? b : a));
  const fixed = best(inks);
  if (fixed.ratio >= target) return fixed.ink;
  const pure = best(pureInks);
  return pure.ratio > fixed.ratio ? pure.ink : fixed.ink;
}

/** Whether the element shows the high-contrast colors, set on its Theme or asked by the system. */
function isHighContrast(element: Element) {
  const contrast = element.closest('.env-theme')?.getAttribute('data-env-contrast');
  return (
    contrast === 'high' ||
    (contrast !== 'standard' && matchMedia('(prefers-contrast: more)').matches)
  );
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
          // The name starts as the swatch reads, its value, so the visible text is in it.
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

/**
 * The editable palette, on the colors guide in the Docs: every color role a component paints, by
 * its token, with its value in the current theme. Pressing a swatch picks another color for it in
 * this theme, for this visit only, and the whole catalogue follows.
 */
export function ColorPalette() {
  const { theme, contrast: themeContrast } = useTheme();
  const { palettes } = usePaletteCustomization();
  const paletteElement = useRef<HTMLDivElement>(null);
  const [colorValues, setColorValues] = useState<Record<string, MeasuredColor>>({});
  // The system's contrast preference changes the colors without a change of theme: measure again.
  const [systemContrast, setSystemContrast] = useState(0);
  useEffect(() => {
    const query = matchMedia('(prefers-contrast: more)');
    const change = () => setSystemContrast((count) => count + 1);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useLayoutEffect(() => {
    if (!paletteElement.current) return;
    const target = isHighContrast(paletteElement.current) ? 7 : 4.5;
    const computedStyle = getComputedStyle(paletteElement.current);
    const context = document
      .createElement('canvas')
      .getContext('2d', { willReadFrequently: true })!;
    const measuredColors: Record<string, MeasuredColor> = {};
    const pageColor = computedStyle.getPropertyValue('--env-color-bg-page');
    context.fillStyle = pageColor;
    context.fillRect(0, 0, 1, 1);
    const page = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    // Every token's probe goes in before any is read, so the page's styles are worked out once
    // rather than once a token: each read after a change to the page restyles all of it.
    const probes = colorGroups.flatMap(([, tokens]) =>
      tokens.map(([token]) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${colorVariable(token)})`;
        probe.hidden = true;
        paletteElement.current!.append(probe);
        return { token, probe };
      }),
    );
    for (const { token, probe } of probes) {
      // Translucent colors, such as the neutral fill, are measured as painted on the page.
      context.fillStyle = pageColor;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = getComputedStyle(probe).color;
      context.fillRect(0, 0, 1, 1);
      const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      measuredColors[token] = {
        css: computedStyle.getPropertyValue(colorVariable(token)).trim(),
        hex: '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join(''),
        ink: inkFor(rgb, target),
        edge: contrast(rgb, page) < 1.02,
      };
    }
    for (const { probe } of probes) probe.remove();
    setColorValues(measuredColors);
  }, [theme, themeContrast, systemContrast, palettes]);
  return (
    // Each group is an Example, so the visual baseline captures it; their margins space them.
    <Column ref={paletteElement} gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <Example key={group} title={group} size="collection" explains>
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
