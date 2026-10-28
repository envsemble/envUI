import { Badge } from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { EditNote } from '@envsemble/envui/icons/EditNote';
import { RateReview } from '@envsemble/envui/icons/RateReview';
import { RocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useTimeline } from '../motion/Motion';

/* A piece of work's state as it moves on, each in its tone. */
const states = [
  { tone: 'accent', label: 'In review', icon: <RateReview /> },
  { tone: 'success', label: 'Approved', icon: <CheckCircle /> },
  { tone: 'done', label: 'Released', icon: <RocketLaunch /> },
  { tone: 'neutral', label: 'Draft', icon: <EditNote /> },
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
