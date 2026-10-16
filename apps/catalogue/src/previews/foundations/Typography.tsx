import { type ReactNode } from 'react';
import { Text, Stack } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

const textVariants = [
  ['Display', 'display', '--env-color-fg-default', '1.75–2.75 rem · 500'],
  ['Page heading', 'page-heading', '--env-color-fg-default', '1.125 rem · 500'],
  ['Section heading', 'section-heading', '--env-color-fg-default', '1 rem · 500'],
  ['Body text', 'body', '--env-color-fg-default', '0.9375 rem · 400'],
  ['Supporting text', 'supporting', '--env-color-fg-muted', '0.875 rem · 400'],
  ['Caption', 'caption', '--env-color-fg-muted', '0.875 rem · 400'],
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
      <Example
        title="Text variants"
        size="wide"
        caption="Text adds no outer margins; the container supplies spacing."
      >
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
      </Example>
      <Example
        title="Text component"
        size="wide"
        caption="Visual emphasis and HTML heading level are independent."
      >
        <ol className="docs-type-list">
          <TextSpecimen
            sample={
              <Text as="h3" variant="page-heading">
                Project overview
              </Text>
            }
          >
            <Text as="span" variant="caption">
              Page emphasis · semantic heading
            </Text>
          </TextSpecimen>
          <TextSpecimen sample={<Text tone="muted">Shared project context.</Text>}>
            <Text as="span" variant="caption">
              Body size · supporting color
            </Text>
          </TextSpecimen>
          <TextSpecimen sample={<Text tone="quiet">Updated today.</Text>}>
            <Text as="span" variant="caption">
              Body size · quiet color
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
              Inline supporting text
            </Text>
          </TextSpecimen>
        </ol>
      </Example>
    </>
  );
}
