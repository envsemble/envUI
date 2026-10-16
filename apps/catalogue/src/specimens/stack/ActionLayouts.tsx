import { ActionGroup, Button, IconButton } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Wrapped rows at each alignment, and a stacked group with an icon-only button. */
export default function ActionLayouts() {
  return (
    <Example title="Action groups" size="collection">
      <SpecimenGrid>
        {(['start', 'center', 'end'] as const).map((align) => (
          <Specimen
            key={align}
            title={`align="${align}"`}
            caption="1 rem apart; wraps when needed."
          >
            <ActionGroup align={align}>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </ActionGroup>
          </Specimen>
        ))}
        <Specimen title="stacked" caption="0.5 rem apart; labelled buttons fill the group.">
          <ActionGroup stacked>
            <Button>Save changes</Button>
            <Button variant="secondary">Cancel</Button>
            <IconButton icon={<MoreHoriz />} aria-label="More actions" />
          </ActionGroup>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
