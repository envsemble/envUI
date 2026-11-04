import { ColorPicker } from '@envsemble/envui/color';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

/** Small pickers, centred in their cells, so the four states take little room. */
const small = { inlineSize: 'min(100%, 11rem)', marginInline: 'auto' };

/** Read-only, disabled and invalid pickers beside an editable one. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Editable">
          <ColorPicker label="Accent color" defaultValue="#3b6fd4" style={small} />
        </Specimen>
        <Specimen title="Read only">
          <ColorPicker label="Workspace color" defaultValue="#2f8f5b" readOnly style={small} />
        </Specimen>
        <Specimen title="Disabled">
          <ColorPicker
            label="Unavailable color"
            defaultValue="#c2413b"
            description="Set by the theme."
            disabled
            style={small}
          />
        </Specimen>
        <Specimen title="With an error">
          <ColorPicker
            label="Brand color"
            defaultValue="#e8c547"
            error="Too light for text on white."
            style={small}
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
