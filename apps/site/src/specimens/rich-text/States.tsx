import { RichTextEditor } from '@envsemble/envui/rich-text';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const notes = 'Send the **press kit** to Priya Shah by Friday.';

/** The editor's looks and states, for review: two to a row, each three lines tall. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Outline">
          <RichTextEditor
            className="catalogue-short-editor"
            label="Outline notes"
            defaultValue={notes}
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Ghost">
          <RichTextEditor
            className="catalogue-short-editor"
            label="Ghost notes"
            variant="ghost"
            defaultValue={notes}
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Empty, with a placeholder">
          <RichTextEditor
            className="catalogue-short-editor"
            label="Empty notes"
            placeholder="Write the notes"
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Invalid">
          <RichTextEditor
            className="catalogue-short-editor"
            label="Invalid notes"
            description="Shown to the whole team."
            error="Add at least one decision."
            toolbar={false}
          />
        </Specimen>
        <Specimen title="Read only" caption="The toolbar is disabled, and so is editing.">
          <RichTextEditor
            className="catalogue-short-editor"
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
