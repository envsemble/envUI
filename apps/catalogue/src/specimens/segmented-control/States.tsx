import { SegmentedControl } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const statuses = [
  { value: 'open', label: 'Open', count: 12 },
  { value: 'blocked', label: 'Blocked', count: 3 },
  { value: 'done', label: 'Done', count: 40 },
];
const ignore = () => undefined;

/** Counts, icons, a disabled option and a disabled control. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <Specimen title="With counts">
          <SegmentedControl
            aria-label="Work items"
            value="open"
            onValueChange={ignore}
            items={statuses}
          />
        </Specimen>
        <Specimen title="With icons">
          <SegmentedControl
            aria-label="Layout"
            value="board"
            onValueChange={ignore}
            items={[
              { value: 'list', label: 'List', icon: <ViewList /> },
              { value: 'board', label: 'Board', icon: <ViewModule /> },
            ]}
          />
        </Specimen>
        <Specimen title="A disabled option">
          <SegmentedControl
            aria-label="Period"
            value="week"
            onValueChange={ignore}
            items={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'quarter', label: 'Quarter', disabled: true },
            ]}
          />
        </Specimen>
        <Specimen title="Disabled">
          <SegmentedControl
            aria-label="Work items, unavailable"
            value="blocked"
            onValueChange={ignore}
            items={statuses}
            disabled
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
