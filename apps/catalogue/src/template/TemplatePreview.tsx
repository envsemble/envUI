import { useRef, useState } from 'react';
import { Link, SegmentedControl, Stack, Text, useContainerSize, useTheme } from '@envsemble/envui';
import { ExampleCode } from './LiveExample';
import { frameHref } from './TemplateFrame';

/** The nominal viewports a template renders at, scaled down to the column's width. */
export const templateWidths = [
  { value: 'desktop', label: 'Desktop', width: 1280, height: 800 },
  { value: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { value: 'phone', label: 'Phone', width: 390, height: 844 },
] as const;
export const templateScales = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
] as const;

/** CSS zoom scales a frame's layout box too; where a browser lacks it, a transform scales it. */
const zoomSupported = typeof CSS !== 'undefined' && CSS.supports('zoom', '0.5');

function Frame({
  page,
  name,
  title,
  scale,
  viewport,
}: {
  page: string;
  name: string;
  title: string;
  scale: (typeof templateScales)[number];
  viewport: (typeof templateWidths)[number];
}) {
  const { theme } = useTheme();
  const box = useRef<HTMLDivElement>(null);
  const size = useContainerSize(box);
  const factor = Math.min(1, (size?.inlineSize ?? viewport.width) / viewport.width);
  const href = frameHref({
    page,
    name,
    scale: scale.value,
    theme: theme === 'dark' ? 'dark' : 'light',
  });
  return (
    <Stack gap={2} className="docs-template-frame-entry" data-scale={scale.value}>
      <Stack direction="row" wrap align="center" justify="between" gap={3}>
        <Text variant="body-sm" emphasis="muted">
          {scale.label} scale · {viewport.label} {viewport.width} × {viewport.height}
        </Text>
        <Link href={href} target="_blank" rel="noreferrer">
          Open {scale.label.toLowerCase()} in a new tab
        </Link>
      </Stack>
      <div ref={box} className="docs-template-frame-box">
        <div
          className="docs-template-frame-viewport"
          style={{ blockSize: viewport.height * factor, inlineSize: viewport.width * factor }}
        >
          <iframe
            src={href}
            title={`${title}, ${scale.label.toLowerCase()} scale`}
            loading="lazy"
            className="docs-template-frame"
            style={{
              inlineSize: viewport.width,
              blockSize: viewport.height,
              ...(zoomSupported ? { zoom: factor } : { transform: `scale(${factor})` }),
            }}
          />
        </div>
      </div>
    </Stack>
  );
}

/**
 * A template's screen on its page: one frame per scale, comfortable and compact, each at a nominal
 * viewport scaled to the column, with a width control, links to open each frame alone and the
 * file's source. The frames are pages of the frame route (TemplateFrame), so the screen lays out
 * against a viewport of its own; the docs' theme passes into them.
 */
export function TemplatePreview({
  page,
  name,
  title,
}: {
  page: string;
  name: string;
  title: string;
}) {
  const [width, setWidth] = useState<(typeof templateWidths)[number]['value']>('desktop');
  const viewport = templateWidths.find((item) => item.value === width) ?? templateWidths[0];
  return (
    <Stack gap={4} className="docs-template-preview" data-template={name}>
      <SegmentedControl
        aria-label={`Width of the ${title} preview`}
        size="sm"
        items={templateWidths.map(({ value, label }) => ({ value, label }))}
        value={width}
        onValueChange={(value) => setWidth(value as typeof width)}
      />
      {templateScales.map((scale) => (
        <Frame
          key={scale.value}
          page={page}
          name={name}
          title={title}
          scale={scale}
          viewport={viewport}
        />
      ))}
      <ExampleCode page={page} name={name} />
    </Stack>
  );
}
