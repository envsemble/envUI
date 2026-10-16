import { SegmentedControl } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const options = [
  { value: 'open', label: 'Open', count: 12 },
  { value: 'blocked', label: 'Blocked', count: 3 },
  { value: 'done', label: 'Done', count: 40 },
];
const layouts = [
  { value: 'list', label: 'List', icon: <ViewList /> },
  { value: 'board', label: 'Board', icon: <ViewModule /> },
];
const ignore = () => undefined;

/** Both sizes, counts and icons, a disabled option and group, and a full-width rail, for review. */
export default function Sizes() {
  return (
    <Example title="Sizes and states" size="collection">
      <SpecimenGrid>
        <Specimen title="Standard, with counts">
          <SegmentedControl
            aria-label="Work items"
            value="open"
            onValueChange={ignore}
            options={options}
          />
        </Specimen>
        <Specimen title="Compact, with icons">
          <SegmentedControl
            aria-label="Layout"
            size="sm"
            value="board"
            onValueChange={ignore}
            options={layouts}
          />
        </Specimen>
        <Specimen title="A disabled option">
          <SegmentedControl
            aria-label="Period"
            value="week"
            onValueChange={ignore}
            options={[
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
            options={options}
            disabled
          />
        </Specimen>
        <Specimen title="Full width, with room">
          <SegmentedControl
            fullWidth
            aria-label="Scope"
            value="team"
            onValueChange={ignore}
            options={[
              { value: 'mine', label: 'Mine', count: 4 },
              { value: 'team', label: 'Team', count: 12 },
              { value: 'all', label: 'All' },
            ]}
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
