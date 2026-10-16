import { Button, IconButton, Stack } from '@envsemble/envui';
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
            <Stack direction="row" wrap align="center" gap={4} justify={align}>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </Stack>
          </Specimen>
        ))}
        <Specimen title="stacked" caption="0.5 rem apart; labelled buttons fill the group.">
          <Stack gap={2}>
            <Button fullWidth>Save changes</Button>
            <Button variant="secondary" fullWidth>
              Cancel
            </Button>
            <IconButton icon={<MoreHoriz />} aria-label="More actions" />
          </Stack>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
