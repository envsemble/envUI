import { Switch } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Off, on and disabled switches, and a label that wraps, for review. */
export default function States() {
  return (
    <Example title="States" size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Off">
          <Switch label="Show completed tasks" />
        </Specimen>
        <Specimen title="On">
          <Switch label="Show completed tasks" defaultChecked />
        </Specimen>
        <Specimen title="Disabled, off">
          <Switch label="Share outside Northwind" disabled />
        </Specimen>
        <Specimen title="Disabled, on">
          <Switch label="Two-step sign-in" defaultChecked disabled />
        </Specimen>
        <Specimen title="Long label" caption="The label wraps beside the track.">
          <Switch label="E-mail me a summary of every comment, mention and assignment each morning" />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
