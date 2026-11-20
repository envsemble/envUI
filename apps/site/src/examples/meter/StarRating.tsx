import { Column, Row, Text } from '@envsemble/envui';
import { IconStar } from '@envsemble/envui/icons/Star';

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  const shown = Math.min(max, Math.max(0, Math.round(value * 2) / 2));
  return (
    <Row
      role="img"
      aria-label={`${shown} out of ${max} stars`}
      align="center"
      gap={0}
      style={{
        '--env-icon-size': 'var(--env-icon-size-md)',
        color: 'var(--env-color-border-default)',
      }}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, shown - index));
        return (
          <span key={index} style={{ position: 'relative', display: 'inline-flex' }}>
            <IconStar filled />
            {fill > 0 && (
              <span
                style={{
                  position: 'absolute',
                  insetBlock: 0,
                  insetInlineStart: 0,
                  inlineSize: `${fill * 100}%`,
                  display: 'inline-flex',
                  overflow: 'hidden',
                }}
              >
                <IconStar filled tone="warning" style={{ flex: 'none', maxInlineSize: 'none' }} />
              </span>
            )}
          </span>
        );
      })}
    </Row>
  );
}

export default function StarRating() {
  return (
    <Column gap={2} align="start">
      <Text render={<h3 />} variant="title">
        Northwind Studio
      </Text>
      <Row align="center" gap={2}>
        <Text render={<span />} aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>
          4.5
        </Text>
        <Stars value={4.5} />
      </Row>
      <Text variant="body-sm">Average of 128 reviews</Text>
    </Column>
  );
}
