import { Select } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const options = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

/*
 * Open on Team, then closed on Private, open on Private and closed on Team, back to the start.
 * Select opens only by itself or with defaultOpen, so each step remounts it, open or closed.
 */
const steps = [900, 900, 1100, 900];
const shown = [
  { value: 'team', open: true },
  { value: 'private', open: false },
  { value: 'private', open: true },
  { value: 'team', open: false },
];

/** A select, open on its options, choosing one and then the other. */
export default function SelectTile() {
  const { value, open } = shown[useTimeline(steps)]!;
  return (
    <Select
      key={`${value}-${open}`}
      aria-label="Visibility"
      items={options}
      value={value}
      defaultOpen={open}
    />
  );
}
