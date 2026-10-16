import { SearchField, TextField, Textarea } from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Every appearance and size side by side, filled, for review. */
export default function Appearances() {
  return (
    <Example
      title="Appearances"
      size="collection"
      caption="Focus a field to see its focus look; plain fields show their underline only then."
    >
      <SpecimenGrid>
        <Specimen title="Outlined">
          <TextField
            label="Project name"
            defaultValue="Northwind launch"
            hint="A name your team will know at a glance."
          />
        </Specimen>
        <Specimen title="Plain">
          <TextField
            variant="plain"
            label="Project name"
            defaultValue="Northwind launch"
            hint="A name your team will know at a glance."
          />
        </Specimen>
        <Specimen title="Quiet">
          <SearchField variant="quiet" label="Find projects" placeholder="Find projects" />
        </Specimen>
        <Specimen title="Compact">
          <TextField
            showLabel={false}
            label="Invite by e-mail"
            placeholder="name@example.com"
            startIcon={<Mail />}
          />
        </Specimen>
        <Specimen title="Compact with a label">
          <TextField
            showLabel
            label="Invite address"
            defaultValue="team@example.com"
            startIcon={<Mail />}
          />
        </Specimen>
        <Specimen title="Compact search">
          <SearchField
            label="Search members"
            placeholder="Search by name or e-mail"
            defaultValue="Priya"
          />
        </Specimen>
        <Specimen title="Outlined textarea">
          <Textarea label="Description" rows={3} defaultValue="Capture notes and ideas." />
        </Specimen>
        <Specimen title="Plain textarea">
          <Textarea
            variant="plain"
            label="Notes"
            sizing="content"
            rows={3}
            defaultValue="Capture notes and ideas."
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
