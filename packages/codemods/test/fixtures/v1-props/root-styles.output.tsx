import { TextField, Checkbox, Switch, Radio, RadioGroup, Select } from '@envsemble/envui';

export function Settings({ styles }) {
  return (
    <form className="settings">
      <TextField label="Name" className="name-input" />
      <Checkbox label="Notify" style={{ marginInlineStart: 4 }} />
      <Switch label="Sync" className={styles.toggle} style={styles.sync} />
      <RadioGroup label="Plan" className="plans">
        <Radio value="free" label="Free" className="plan" />
      </RadioGroup>
      <Select label="Region" items={[]} />
    </form>
  );
}
