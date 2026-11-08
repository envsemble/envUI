import { Card, Column, Grid, Text } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../motion/MotionStage';

/*
 * Two loads that start together, on one timeline: a quick one, whose project lands at 0.1 s,
 * before the skeleton's delay of 0.2 s has passed, so no skeleton flashes; and a slow one, whose
 * skeleton shows once the delay has passed, until its project lands at 1.6 s. A while to read, and
 * both fade to start again. A timeline's steps are paced to 0.6 of what they say, so each is
 * written as its real length over 0.6.
 */
const steps = [170, 170, 2330, 4200, 420];

interface Load {
  arrives: string;
  /** The step its project lands at, and the step its skeleton shows from, if it shows at all. */
  lands: number;
  skeleton?: number;
  name: string;
  updated: string;
  summary: string;
}

const loads: Load[] = [
  {
    arrives: 'Arrives in 0.1 s',
    lands: 1,
    name: 'Launch brief',
    updated: 'Today',
    summary: 'Goals and dates.',
  },
  {
    arrives: 'Arrives in 1.6 s',
    lands: 3,
    skeleton: 2,
    name: 'Budget',
    updated: 'Monday',
    summary: 'Spend by quarter.',
  },
];

function Loads() {
  const step = useTimeline(steps);
  return (
    <Grid columns={{ min: '12rem' }} gap={5} style={{ inlineSize: 'min(100%, 30rem)' }}>
      {loads.map((load) => {
        const landed = step >= load.lands;
        const skeleton = !landed && load.skeleton !== undefined && step >= load.skeleton;
        return (
          <Column key={load.name} gap={3}>
            <div
              style={{
                // Until the project lands or the delay passes, the card keeps its space, hidden.
                visibility: landed || skeleton ? undefined : 'hidden',
                opacity: step === 4 ? 0 : 1,
                transition: step === 4 ? 'opacity 200ms ease' : undefined,
              }}
            >
              <Card
                skeleton={!landed}
                title={landed ? load.name : undefined}
                meta={landed ? load.updated : undefined}
                description={landed ? load.summary : undefined}
              />
            </div>
            <Text variant="caption" emphasis="muted">
              {load.arrives}
            </Text>
          </Column>
        );
      })}
    </Grid>
  );
}

/** A quick load and a slow one side by side: only the slow one shows its skeleton. */
export default function WhenItShows() {
  return (
    <Example>
      <MotionStage label="a quick load and a slow one">
        <Loads />
      </MotionStage>
    </Example>
  );
}
