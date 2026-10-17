import { useEffect, useRef, useState } from 'react';
import { Button, List, LoadingState, Skeleton, Stack, Text } from '@envsemble/envui';

const projects = [
  { id: 'website-refresh', name: 'Website refresh', owner: 'Alex Morgan' },
  { id: 'quarterly-report', name: 'Quarterly report', owner: 'Priya Shah' },
  { id: 'onboarding-guide', name: 'Onboarding guide', owner: 'Sam Lee' },
];

/** Placeholders appear only once a load has taken this long, so quick loads never flash them. */
const placeholderDelay = 200;

export default function SkeletonList() {
  const [state, setState] = useState<'loaded' | 'waiting' | 'loading'>('loaded');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const reload = () => {
    setState('waiting');
    // The projects load from a server; timers stand in for it here.
    timers.current = [
      window.setTimeout(() => setState('loading'), placeholderDelay),
      window.setTimeout(() => setState('loaded'), 1600),
    ];
  };
  return (
    <Stack gap={4}>
      <Stack direction="row" align="center" justify="between" gap={4}>
        <Text render={<h3 />} variant="title">
          Projects
        </Text>
        <Button variant="secondary" size="sm" disabled={state !== 'loaded'} onClick={reload}>
          Reload
        </Button>
      </Stack>
      {state === 'loaded' ? (
        <List.Root aria-label="Projects">
          {projects.map((project) => (
            <List.Item key={project.id} label={project.name} description={project.owner} />
          ))}
        </List.Root>
      ) : state === 'loading' ? (
        // One placeholder row per expected row, in the shape of a name and its owner.
        <LoadingState label="Loading projects">
          {projects.map((project, row) => (
            <Stack key={project.id} gap={2}>
              <Skeleton width={`${44 - row * 8}%`} height="1rem" emphasis="default" />
              <Skeleton width="24%" height="0.75rem" />
            </Stack>
          ))}
        </LoadingState>
      ) : null}
    </Stack>
  );
}
