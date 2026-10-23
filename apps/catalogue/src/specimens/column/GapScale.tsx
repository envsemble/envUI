import { Column, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const steps: { step: SpaceStep; rem: string }[] = [
  { step: 1, rem: '0.25 rem' },
  { step: 2, rem: '0.5 rem' },
  { step: 3, rem: '0.75 rem' },
  { step: 4, rem: '1 rem' },
  { step: 5, rem: '1.5 rem' },
  { step: 6, rem: '2 rem' },
  { step: 7, rem: '2.5 rem' },
  { step: 8, rem: '3 rem' },
  { step: 9, rem: '4 rem' },
];

/** Every step of the spacing scale as the gap between two blocks. */
export default function GapScale() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {steps.map(({ step, rem }) => (
          <Specimen key={step} title={`gap={${step}}`} caption={rem}>
            <Column gap={step}>
              <Surface background="muted" radius="sm" padding={2}>
                <Text>First</Text>
              </Surface>
              <Surface background="muted" radius="sm" padding={2}>
                <Text>Second</Text>
              </Surface>
            </Column>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
