import { Button, Row, Surface } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** A row of two actions at each value of justify, on a muted fill that shows the row's width. */
export default function Justify() {
  return (
    <Example size="collection">
      <SpecimenGrid size="wide">
        {(['start', 'center', 'end', 'between'] as const).map((justify) => (
          <Specimen key={justify} title={`justify="${justify}"`}>
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
