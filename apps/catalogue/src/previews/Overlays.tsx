import { Button, IconButton, Meter, Progress, Tooltip } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function TooltipPreview() {
  return (
    <Preview>
      <Example title="Tooltips" size="collection" caption="Hover or focus each control.">
        <SpecimenGrid>
          <Specimen title="Icon-only action">
            <Tooltip content="Refresh seats and members">
              <IconButton icon={<Refresh />} aria-label="Refresh seats and members" />
            </Tooltip>
          </Specimen>
          <Specimen title="Why a control is disabled">
            <Tooltip content="All seats are assigned">
              <Button disabled>Assign seat</Button>
            </Tooltip>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function MeterPreview() {
  return (
    <Preview>
      <Example title="Meter" size="collection">
        <SpecimenGrid>
          <Specimen title="A quantity in a range">
            <Meter label="Seats assigned" value={2} max={5} valueText="2 of 5" />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function ProgressPreview() {
  return (
    <Preview>
      <Example title="Progress" size="collection">
        <SpecimenGrid>
          <Specimen title="Known amount">
            <Progress label="Uploading" value={40} valueText="40%" />
          </Specimen>
          <Specimen title="Indeterminate">
            <Progress label="Preparing export" value={null} />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
