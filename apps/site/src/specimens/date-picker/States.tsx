import { DatePicker } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

/** Invalid, read-only and disabled fields. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <SpecimenPart title="Invalid">
          <DatePicker label="Ends" required error="Choose a day after the start." />
        </SpecimenPart>
        <SpecimenPart title="Read only">
          <DatePicker
            label="Created"
            defaultValue="2026-09-30T16:45"
            granularity="minute"
            readOnly
          />
        </SpecimenPart>
        <SpecimenPart title="Disabled">
          <DatePicker label="Archived on" defaultValue="2026-08-14" disabled />
        </SpecimenPart>
      </SpecimenGrid>
    </Example>
  );
}
