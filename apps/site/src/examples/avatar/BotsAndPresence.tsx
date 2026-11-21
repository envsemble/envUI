import { Avatar, Row } from '@envsemble/envui';
import { IconAutoAwesome } from '@envsemble/envui/icons/AutoAwesome';

const onlineDot = (
  <span
    style={{
      display: 'block',
      inlineSize: '0.75rem',
      blockSize: '0.75rem',
      borderRadius: '50%',
      background: 'var(--env-color-bg-success-emphasis)',
      boxShadow: '0 0 0 2px var(--env-color-bg-page)',
    }}
  />
);

export default function BotsAndPresence() {
  return (
    <Row wrap align="center" gap={4}>
      <Avatar name="Alex Morgan" size="lg" badge={onlineDot} named />
      <Avatar name="Review agent" hue="orchid" fallback={<IconAutoAwesome />} size="lg" named />
    </Row>
  );
}
