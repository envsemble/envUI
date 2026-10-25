import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Column,
  DescriptionList,
  Progress,
  Row,
  Select,
  Text,
  TextField,
  Textarea,
} from '@envsemble/envui';

const steps = ['Project', 'Team', 'Review'];

export default function LongFormInSteps() {
  const [step, setStep] = useState(0);
  // The answers live above the steps, so going back keeps them.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('alex-morgan');
  const [nameError, setNameError] = useState<string>();
  const [status, setStatus] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  // Each new step moves focus to its heading, so it is read from the start.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  const go = (next: number) => {
    moved.current = true;
    setStep(next);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Each step checks its own fields before people move on.
    if (step === 0 && !name.trim()) {
      setNameError('Enter a project name');
      nameField.current?.focus();
      return;
    }
    if (step < steps.length - 1) go(step + 1);
    else setStatus(`${name.trim()} created.`);
  };

  return (
    // noValidate: the form checks its own fields and words its own errors.
    <form noValidate onSubmit={submit} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        <Progress
          label="Create project"
          value={step + 1}
          max={steps.length}
          segments={steps.length}
          valueText={`Step ${step + 1} of ${steps.length}`}
          aria-valuetext={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        />
        <Text ref={heading} tabIndex={-1} render={<h3 />} variant="title">
          {steps[step]}
        </Text>
        {step === 0 && (
          <>
            <TextField
              ref={nameField}
              label="Project name"
              autoComplete="off"
              value={name}
              error={nameError}
              onValueChange={(value) => {
                setName(value);
                if (value.trim()) setNameError(undefined);
              }}
            />
            <Textarea
              label="Description (optional)"
              rows={3}
              value={description}
              onValueChange={setDescription}
            />
          </>
        )}
        {step === 1 && (
          <Select
            label="Owner"
            items={owners}
            value={owner}
            onValueChange={(value) => setOwner(value ?? owner)}
          />
        )}
        {step === 2 && (
          <DescriptionList.Root aria-label="Your answers">
            <DescriptionList.Item label="Project name">{name}</DescriptionList.Item>
            <DescriptionList.Item label="Description">{description || 'None'}</DescriptionList.Item>
            <DescriptionList.Item label="Owner">
              {owners.find(({ value }) => value === owner)?.label}
            </DescriptionList.Item>
          </DescriptionList.Root>
        )}
        {/* The step's action comes first, with Back after it from the second step. */}
        <Row wrap gap={3}>
          <Button type="submit">{step < steps.length - 1 ? 'Continue' : 'Create project'}</Button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => go(step - 1)}>
              Back
            </Button>
          )}
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
];
