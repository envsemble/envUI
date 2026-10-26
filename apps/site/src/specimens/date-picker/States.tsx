import { DatePicker } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Invalid, read-only and disabled fields. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <Specimen title="Invalid">
          <DatePicker label="Ends" required error="Choose a day after the start." />
        </Specimen>
        <Specimen title="Read only">
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
      </SpecimenGrid>
    </Example>
  );
}
