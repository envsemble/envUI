import { ColorPicker } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Read-only, disabled and invalid pickers beside an editable one. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <Specimen title="Editable">
          <ColorPicker label="Accent color" defaultValue="#3b6fd4" />
        </Specimen>
        <Specimen title="Read only">
          <ColorPicker label="Workspace color" defaultValue="#2f8f5b" readOnly />
        </Specimen>
        <Specimen title="Disabled">
          <ColorPicker label="Unavailable color" defaultValue="#c2413b" disabled />
        </Specimen>
        <Specimen title="With an error">
          <ColorPicker
            label="Brand color"
            defaultValue="#e8c547"
            error="This color is too light for text on white."
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
