import { AnimatedNumber, Badge, DescriptionList } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/* The open tasks counted down to none, when the project is done, and opened again. */
const steps = [
  { tasks: 3, done: false },
  { tasks: 2, done: false },
  { tasks: 1, done: false },
  { tasks: 0, done: true },
];

/** A project's details: its owner, its state and its open tasks, which change as work goes on. */
export default function DescriptionListTile() {
  const { tasks, done } = steps[useTimeline([900, 900, 900, 1600])]!;
  return (
    // As wide as it is in progress, so the shorter Done doesn't move the labels.
    <DescriptionList.Root
      layout="inline"
      aria-label="Project details"
      style={{ inlineSize: '9rem' }}
    >
      <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
      <DescriptionList.Item label="Status">
        <Badge tone={done ? 'done' : 'primary'}>{done ? 'Done' : 'In progress'}</Badge>
      </DescriptionList.Item>
      <DescriptionList.Item label="Tasks">
        <AnimatedNumber value={tasks} />
      </DescriptionList.Item>
    </DescriptionList.Root>
  );
}
