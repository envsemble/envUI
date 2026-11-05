import { Badge, Text } from '@envsemble/envui';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconRateReview } from '@envsemble/envui/icons/RateReview';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useMedia } from '../motion/Autoplay';
import { narrowGallery } from './Tiles';

/* A piece of work's states, each in its tone. */
const states = {
  draft: { tone: 'neutral', label: 'Draft', icon: <IconEditNote /> },
  review: { tone: 'primary', label: 'In review', icon: <IconRateReview /> },
  released: { tone: 'done', label: 'Released', icon: <IconRocketLaunch /> },
} as const;

/**
 * A few pieces of work, each with a badge naming its state, in its tone. A badge shows a state it is
 * given and changes only when the state does, so the tile holds still. Its names are short, the
 * same at every width; in a phone's narrower tile they sit closer to their badges, so it is drawn
 * at about its own size there.
 */
export default function BadgeTile() {
  const narrow = useMedia(narrowGallery);
  const work = [
    { name: 'Launch', state: 'review' },
    { name: 'Brand', state: 'released' },
    { name: 'Pricing', state: 'draft' },
  ] as const;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: narrow ? 'var(--env-space-3)' : 'var(--env-space-6)',
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
