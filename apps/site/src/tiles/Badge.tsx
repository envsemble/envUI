import { Badge } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconRateReview } from '@envsemble/envui/icons/RateReview';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useTimeline } from '../motion/Motion';

/* A piece of work's state as it moves on, each in its tone. */
const states = [
  { tone: 'primary', label: 'In review', icon: <IconRateReview /> },
  { tone: 'success', label: 'Approved', icon: <IconCheckCircle /> },
  { tone: 'done', label: 'Released', icon: <IconRocketLaunch /> },
  { tone: 'neutral', label: 'Draft', icon: <IconEditNote /> },
] as const;

/** A badge naming a state, which moves on from in review to approved, released and a new draft. */
export default function BadgeTile() {
  const { tone, label, icon } = states[useTimeline([1100, 1100, 1100, 1100])]!;
  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
