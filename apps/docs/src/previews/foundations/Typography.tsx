import { type ReactNode } from 'react';
import { Text, Card, Stack } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

const textVariants = [
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

export function TypographyPreview() {
  return (
    <>
      <Example title="Text variants" size="wide">
        <Card tone="pane">
          <ol className="docs-type-list">
            {textVariants.map(([title, variant, color, meta]) => (
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
