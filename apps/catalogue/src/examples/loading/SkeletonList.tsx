import { useEffect, useRef, useState } from 'react';
import { List, LoadingState, SegmentedControl, Skeleton, Stack } from '@envsemble/envui';

const teams = [
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
];
const projects: Record<string, { id: string; name: string; owner: string }[]> = {
  design: [
    { id: 'website-refresh', name: 'Website refresh', owner: 'Alex Morgan' },
    { id: 'icon-set', name: 'Icon set', owner: 'Sam Lee' },
    { id: 'onboarding-guide', name: 'Onboarding guide', owner: 'Priya Shah' },
  ],
  marketing: [
    { id: 'spring-campaign', name: 'Spring campaign', owner: 'Priya Shah' },
    { id: 'customer-survey', name: 'Customer survey', owner: 'Sam Lee' },
    { id: 'press-kit', name: 'Press kit', owner: 'Alex Morgan' },
  ],
  sales: [
    { id: 'quarterly-report', name: 'Quarterly report', owner: 'Sam Lee' },
    { id: 'partner-pricing', name: 'Partner pricing', owner: 'Alex Morgan' },
    { id: 'trade-show', name: 'Trade show', owner: 'Priya Shah' },
  ],
};

/** Placeholders appear only once a load has taken this long, so quick loads never flash them. */
const placeholderDelay = 200;

export default function SkeletonList() {
  const [team, setTeam] = useState('design');
  // Teams whose projects have loaded; each loads the first time it is chosen.
  const [loaded, setLoaded] = useState<string[]>(['design']);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const timers = useRef<number[]>([]);
  const clearTimers = () => timers.current.forEach((timer) => window.clearTimeout(timer));
  useEffect(() => clearTimers, []);
  const choose = (next: string) => {
    clearTimers();
    setTeam(next);
    setShowPlaceholders(false);
    if (loaded.includes(next)) return;
    // The projects load from a server; timers stand in for it here.
    timers.current = [
      window.setTimeout(() => setShowPlaceholders(true), placeholderDelay),
      window.setTimeout(() => setLoaded((current) => [...current, next]), 1600),
    ];
  };
  const name = teams.find((option) => option.value === team)?.label;
  return (
    <Stack gap={4}>
      <Stack align="start">
        <SegmentedControl aria-label="Team" value={team} onValueChange={choose} items={teams} />
      </Stack>
      {loaded.includes(team) ? (
        <List.Root aria-label={`${name} projects`}>
          {projects[team].map((project) => (
            <List.Item key={project.id} label={project.name} description={project.owner} />
          ))}
        </List.Root>
      ) : (
        // One placeholder row per expected row, in the shape of a name and its owner. They keep
        // their space, hidden, until the delay has passed, so the example doesn't jump.
        <div style={{ visibility: showPlaceholders ? undefined : 'hidden' }}>
          <LoadingState label={`Loading ${name} projects`}>
            {projects[team].map((project, row) => (
              <Stack key={project.id} gap={2}>
                <Skeleton width={`${44 - row * 8}%`} height="1rem" emphasis="default" />
                <Skeleton width="24%" height="0.75rem" />
              </Stack>
            ))}
          </LoadingState>
        </div>
      )}
    </Stack>
  );
}
