import { Button, Row, Surface } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const justifications = [
  { justify: 'start', title: 'At the start' },
  { justify: 'center', title: 'In the center' },
  { justify: 'end', title: 'At the end' },
  { justify: 'between', title: 'Spread to the edges' },
] as const;

/** A row of two actions at each value of justify, on a muted fill that shows the row's width. */
export default function Justify() {
  return (
    <Example size="collection">
      <SpecimenGrid size="wide">
        {justifications.map(({ justify, title }) => (
          <Specimen key={justify} title={title}>
            <Surface background="muted" radius="sm" padding={2}>
              <Row wrap align="center" gap={2} justify={justify}>
                <Button variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </Row>
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
