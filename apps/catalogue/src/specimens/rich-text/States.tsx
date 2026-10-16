import { RichTextEditor } from '@envsemble/envui/rich-text';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const notes = 'Send the **press kit** to Priya Shah by Friday.';

/** The editor's looks and states, for review. */
export default function States() {
  return (
    <Example title="Editor states" size="collection">
      <SpecimenGrid size="card">
        <Specimen title="Outlined">
          <RichTextEditor label="Outlined notes" defaultValue={notes} toolbar={false} />
        </Specimen>
        <Specimen title="Plain">
          <RichTextEditor
            label="Plain notes"
            variant="plain"
            defaultValue={notes}
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Empty, with a placeholder">
          <RichTextEditor label="Empty notes" placeholder="Write the notes" toolbar={false} />
        </Specimen>
        <Specimen title="Invalid">
          <RichTextEditor
            label="Invalid notes"
            hint="Shown to the whole team."
            error="Add at least one decision."
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Read only" caption="The toolbar is disabled, and so is editing.">
          <RichTextEditor
            label="Read-only notes"
            defaultValue={notes}
            toolbar={['bold', 'italic', 'link']}
            readOnly
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
