import { Badge, Text } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconRateReview } from '@envsemble/envui/icons/RateReview';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useTimeline } from '../motion/Motion';

/* A piece of work's states as it moves on, each in its tone. */
const states = {
  draft: { tone: 'neutral', label: 'Draft', icon: <IconEditNote /> },
  review: { tone: 'primary', label: 'In review', icon: <IconRateReview /> },
  approved: { tone: 'success', label: 'Approved', icon: <IconCheckCircle /> },
  released: { tone: 'done', label: 'Released', icon: <IconRocketLaunch /> },
} as const;

/** The first piece of work's state at each step: in review, approved, released, and in review. */
const moves = ['review', 'approved', 'released'] as const;

/** A few pieces of work, each with a badge naming its state; the first moves on as it plays. */
export default function BadgeTile() {
  const first = moves[useTimeline([1000, 1100, 1300])]!;
  const work = [
    { name: 'Launch plan', state: first },
    { name: 'Brand refresh', state: 'released' },
    { name: 'Pricing page', state: 'draft' },
  ] as const;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: 'var(--env-space-6)',
        rowGap: 'var(--env-space-3)',
      }}
    >
      {work.map(({ name, state }) => {
        const { tone, label, icon } = states[state];
        return (
          <div key={name} style={{ display: 'contents' }}>
            <Text>{name}</Text>
            <Badge tone={tone} icon={icon} style={{ justifySelf: 'start' }}>
              {label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
