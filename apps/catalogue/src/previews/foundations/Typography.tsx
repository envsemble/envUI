import { type ReactNode } from 'react';
import { Text, Column } from '@envsemble/envui';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

const textVariants = [
  ['Display', 'display', '--env-color-fg-default', '1.75–2.75 rem · 500'],
  ['Headline', 'headline', '--env-color-fg-default', '1.125 rem · 500'],
  ['Title', 'title', '--env-color-fg-default', '1 rem · 500'],
  ['Body text', 'body', '--env-color-fg-default', '0.9375 rem · 400'],
  ['Small body', 'body-sm', '--env-color-fg-muted', '0.875 rem · 400'],
  ['Caption', 'caption', '--env-color-fg-muted', '0.875 rem · 400'],
] as const;

function TextSpecimen({ sample, children }: { sample: ReactNode; children: ReactNode }) {
  return (
    <li>
      {sample}
      <Column gap={1} className="docs-type-meta">
        {children}
      </Column>
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
              <Text render={<span />} variant="caption">
                {title} · {meta}
              </Text>
              <Text render={<span />} variant="caption">
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
              <Text render={<h3 />} variant="headline">
                Project overview
              </Text>
            }
          >
            <Text render={<span />} variant="caption">
              Page emphasis · semantic heading
            </Text>
          </TextSpecimen>
          <TextSpecimen sample={<Text emphasis="muted">Shared project context.</Text>}>
            <Text render={<span />} variant="caption">
              Body size · supporting color
            </Text>
          </TextSpecimen>
          <TextSpecimen sample={<Text emphasis="subtle">Updated today.</Text>}>
            <Text render={<span />} variant="caption">
              Body size · quiet color
            </Text>
          </TextSpecimen>
          <TextSpecimen
            sample={
              <Text>
                Project status:{' '}
                <Text render={<span />} emphasis="muted">
                  Draft
                </Text>
              </Text>
            }
          >
            <Text render={<span />} variant="caption">
              Inline supporting text
            </Text>
          </TextSpecimen>
        </ol>
      </Example>
    </>
  );
}
