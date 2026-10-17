import { DatePicker } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Invalid, read-only and disabled fields, and an empty small one. */
export default function States() {
  return (
    <Example title="Date picker states" size="collection">
      <SpecimenGrid>
        <Specimen title="Invalid">
          <DatePicker label="Ends" required error="Choose a day after the start." />
        </Specimen>
        <Specimen title="Read only" caption="Shows the value; the calendar doesn't open.">
          <DatePicker
            label="Created"
            defaultValue="2026-09-30T16:45"
            granularity="minute"
            readOnly
          />
        </Specimen>
        <Specimen title="Disabled">
          <DatePicker label="Archived on" defaultValue="2026-08-14" disabled />
        </Specimen>
        <Specimen title="Compact">
          <DatePicker size="sm" showLabel={false} aria-label="Due" placeholder="Due" />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
