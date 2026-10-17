import { useId, useState } from 'react';
import { Button, List, Stack, Text } from '@envsemble/envui';

/** Enough to scan at a glance; the rest are one press away. */
const shownAtFirst = 5;

export default function ShowMore() {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? activity : activity.slice(0, shownAtFirst);
  return (
    <Stack gap={3}>
      <Text render={<h3 id={`${id}-heading`} />} variant="title">
        Recent activity
      </Text>
      <List.Root id={`${id}-list`} aria-labelledby={`${id}-heading`} density="sm">
        {shown.map((item) => (
          <List.Item key={item.id} label={item.text} description={item.when} />
        ))}
      </List.Root>
      {/* The button stays where it is and keeps focus. Its label says how many there are in all
          and stays the same; aria-expanded says whether they all show. */}
      <Button
        variant="text"
        aria-expanded={expanded}
        aria-controls={`${id}-list`}
        onClick={() => setExpanded((current) => !current)}
      >
        {`Show all ${activity.length}`}
      </Button>
    </Stack>
  );
}

const activity = [
  { id: 1, text: 'Alex Morgan updated the launch brief', when: '4 March 2026' },
  { id: 2, text: 'Priya Shah approved the budget', when: '3 March 2026' },
  { id: 3, text: 'Sam Lee commented on Meeting notes', when: '3 March 2026' },
  { id: 4, text: 'Jordan Kim joined Website refresh', when: '2 March 2026' },
  { id: 5, text: 'Maria Garcia uploaded annual-review.pdf', when: '27 February 2026' },
  { id: 6, text: 'Chen Wei archived Data migration', when: '26 February 2026' },
  { id: 7, text: 'Alex Morgan created Mobile release', when: '25 February 2026' },
  { id: 8, text: 'Sam Lee renamed Budget to Budget 2026', when: '24 February 2026' },
  { id: 9, text: 'Priya Shah invited Jordan Kim', when: '23 February 2026' },
  { id: 10, text: 'Maria Garcia completed Onboarding guide', when: '20 February 2026' },
  { id: 11, text: 'Chen Wei commented on Quarterly report', when: '18 February 2026' },
  { id: 12, text: 'Jordan Kim updated Annual review', when: '16 February 2026' },
];
