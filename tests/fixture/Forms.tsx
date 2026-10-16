import { useState } from 'react';
import {
  Button,
  TextField,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Surface,
  type CheckboxState,
} from '@envsemble/envui';
import { planOptions, dialogOptions } from './SelectOptions.js';

export function FormsFixture() {
  const [controlled, setControlled] = useState<CheckboxState>('mixed');
  const [frozenRequest, setFrozenRequest] = useState('none');
  const [values, setValues] = useState<Record<string, string>>({});
  const [requiredSubmissions, setRequiredSubmissions] = useState(0);
  const [preventReset, setPreventReset] = useState(false);
  const [compactValues, setCompactValues] = useState<Record<string, string>>({});
  return (
    <section className="fixture-section">
      <h1>Native forms</h1>
      <form
        data-testid="main-form"
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setValues(Object.fromEntries([...data].map(([name, value]) => [name, String(value)])));
        }}
      >
        <TextField
          label="Project name"
          hint="A descriptive name"
          name="project"
          defaultValue="Initial project"
          required
        />
        <Textarea
          label="Notes"
          hint="Optional supporting details"
          name="notes"
          defaultValue="Initial notes"
        />
        <TextField
          label="Invalid sample"
          error="Please correct this value"
          defaultValue="Invalid value"
        />
        <Checkbox
          data-testid="controlled-checkbox"
          label="Controlled mixed"
          name="controlled"
          value="enabled"
          checked={controlled}
          onCheckedChange={setControlled}
        />
        <Checkbox
          data-testid="uncontrolled-checkbox"
          label="Uncontrolled mixed"
          name="uncontrolled"
          value="enabled"
          defaultChecked="mixed"
        />
        <Checkbox
          data-testid="frozen-checkbox"
          label="Fixed mixed"
          checked="mixed"
          onCheckedChange={(next) => setFrozenRequest(String(next))}
        />
        <Switch label="Notifications" name="notifications" value="enabled" defaultChecked />
        <RadioGroup
          label="Visibility"
          name="visibility"
          defaultValue="private"
          required
          variant="rows"
        >
          <Radio value="private" label="Private" detail="Only invited members" />
          <Radio value="shared" label="Shared" detail="Anyone with access" />
        </RadioGroup>
        <Select label="Plan" name="plan" options={planOptions} defaultValue="starter" required />
        <Select
          label="Empty choice"
          name="emptyChoice"
          options={dialogOptions}
          placeholder="Choose an option"
        />
        <Checkbox
          label="Prevent form reset"
          checked={preventReset}
          onCheckedChange={setPreventReset}
        />
        <div className="fixture-actions">
          <Button type="submit">Submit form</Button>
          <Button type="reset" variant="secondary">
            Reset form
          </Button>
          <Button variant="outlined" onClick={() => setControlled('mixed')}>
            Restore controlled mixed
          </Button>
        </div>
      </form>
      <output data-testid="control-state">{String(controlled)}</output>
      <output data-testid="frozen-request">{frozenRequest}</output>
      <output data-testid="form-values">{JSON.stringify(values)}</output>
      <form
        data-testid="required-form"
        onSubmit={(event) => {
          event.preventDefault();
          setRequiredSubmissions((count) => count + 1);
        }}
      >
        <Select
          label="Required choice"
          name="requiredChoice"
          options={dialogOptions}
          placeholder="Choose a required option"
          required
        />
        <Button type="submit">Submit required choice</Button>
      </form>
      <output data-testid="required-submissions">{requiredSubmissions}</output>
      <form
        data-testid="compact-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setCompactValues(
            Object.fromEntries([...data].map(([name, value]) => [name, String(value)])),
          );
        }}
      >
        <Select
          density="compact"
          label="Compact plan"
          name="compactPlan"
          options={planOptions}
          defaultValue="starter"
        />
        <Select
          density="compact"
          variant="outlined"
          label="Compact outlined plan"
          options={planOptions}
          defaultValue="team"
        />
        <Button type="submit">Submit compact form</Button>
      </form>
      <output data-testid="compact-values">{JSON.stringify(compactValues)}</output>
      <Surface padding={4} data-testid="select-pane">
        <Select variant="outlined" label="Pane sort" options={planOptions} defaultValue="starter" />
        <Select
          variant="outlined"
          label="Pane role"
          options={dialogOptions}
          defaultValue="aurora"
        />
      </Surface>
      <div data-testid="growing-textareas" className="fixture-actions">
        <Textarea label="One line" sizing="content" rows={1} />
        <Textarea label="Three lines" sizing="content" rows={3} />
        <Textarea label="Default lines" sizing="content" />
        <Textarea label="Two fixed lines" rows={2} />
      </div>
    </section>
  );
}
