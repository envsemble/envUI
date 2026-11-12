import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  DatePicker,
  Radio,
  RadioGroup,
  Select,
  Column,
  Row,
  Text,
  TextField,
  Textarea,
} from '@envsemble/envui';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [creating, setCreating] = useState(false);
  // The status under the actions: the outcome, or the error when a submit is refused.
  const [status, setStatus] = useState('');
  const nameField = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      const message = 'Enter a project name';
      setNameError(message);
      // Focusing the field reads its error. After Enter in the field, focus is already there and
      // focusing it again reads nothing, so only then does the status say the error.
      if (document.activeElement === nameField.current) setStatus(message);
      else {
        setStatus('');
        nameField.current?.focus();
      }
      return;
    }
    setCreating(true);
    setStatus('');
    // The project is created on a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => {
      setCreating(false);
      setStatus(`${name.trim()} created.`);
    }, 1200);
  };

  return (
    // noValidate: the form checks its own fields and words its own errors.
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        <TextField
          ref={nameField}
          label="Project name"
          name="name"
          required
          autoComplete="off"
          value={name}
          error={nameError}
          onValueChange={(value) => {
            setName(value);
            if (value.trim()) {
              setNameError(undefined);
              setStatus('');
            }
          }}
        />
        <Textarea
          label="Description (optional)"
          name="description"
          description="What the project is for, in a sentence or two."
          rows={3}
        />
        <Select label="Owner" name="owner" defaultValue="alex-morgan" items={owners} />
        <DatePicker label="Due date (optional)" name="due" min="2026-03-04" />
        <RadioGroup label="Visibility" name="visibility" orientation="vertical" defaultValue="team">
          <Radio value="team" label="Team" description="Everyone at Northwind can open it." />
          <Radio value="private" label="Private" description="Only the people you invite." />
        </RadioGroup>
        {/* The primary action comes first, at the start, after the last field. */}
        <Row wrap gap={3}>
          <Button type="submit" pending={creating}>
            Create project
          </Button>
          <Button variant="secondary" href="/projects">
            Cancel
          </Button>
        </Row>
        <Text role="status" emphasis="muted">
          {status}
        </Text>
      </Column>
    </form>
  );
}

const owners = [
  { value: 'alex-morgan', label: 'Alex Morgan' },
  { value: 'sam-lee', label: 'Sam Lee' },
  { value: 'priya-shah', label: 'Priya Shah' },
  { value: 'jordan-kim', label: 'Jordan Kim' },
];
