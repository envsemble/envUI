import { ActionGroup, Button, IconButton, Surface } from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** The same toolbar at the standard and the compact control height. */
export default function Density() {
  return (
    <Example title="Density" size="collection">
      <SpecimenGrid size="compact">
        {(['standard', 'compact'] as const).map((density) => (
          <Specimen
            key={density}
            title={density === 'standard' ? 'Standard' : 'Compact'}
            caption={density === 'standard' ? '2.5 rem controls' : '2 rem controls'}
          >
            <Surface
              padding={1}
              corners="pill"
              density={density}
              role="group"
              aria-label={density === 'standard' ? 'Standard toolbar' : 'Compact toolbar'}
              render={<ActionGroup />}
            >
              <Button variant="secondary">Fit</Button>
              <IconButton variant="quiet" icon={<ZoomIn />} aria-label="Zoom in" />
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
