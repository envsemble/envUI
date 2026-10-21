import { Checkbox, Column } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const states = [
  { title: 'Unchecked', checked: false },
  { title: 'Checked', checked: true },
  { title: 'Mixed', checked: 'mixed' },
] as const;

/** Each state enabled and disabled, and a label that wraps. */
export default function States() {
  return (
    <Example title="Checkbox states" size="collection">
      <SpecimenGrid size="compact">
        {states.map(({ title, checked }) => (
          <Specimen key={title} title={title}>
            <Column gap={3}>
              <Checkbox label="Include archived projects" checked={checked} />
              <Checkbox label="Include archived projects" checked={checked} disabled />
            </Column>
          </Specimen>
        ))}
        <Specimen title="Long label">
          <Checkbox
            label="Send a copy of every comment on plans I follow to my e-mail address"
            defaultChecked
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
