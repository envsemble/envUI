import { useId, useState, type ChangeEvent } from 'react';
import { Text } from '@envsemble/envui';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { Example, Specimen } from './Example';
import './FieldDesignProposals.css';

const designs = [
  {
    id: 'edge',
    title: '01 · Edge caption',
    description:
      'An outlined caption tab joins the continuous field border. Errors use a short edge marker.',
  },
  {
    id: 'inset',
    title: '02 · Inset caption',
    description: 'The label settles inside the field. Feedback stays below the value.',
  },
  {
    id: 'rail',
    title: '03 · Side rail',
    description: 'An open field with a single vertical rail for focus and validation.',
  },
  {
    id: 'footer',
    title: '04 · Footer caption',
    description: 'The label moves to the lower edge, leaving the writing area open.',
  },
  {
    id: 'shelf',
    title: '05 · Label shelf',
    description: 'The label stays on a fixed shelf beside the editable value.',
  },
] as const;

const samples = [
  { id: 'name', title: 'Text input', label: 'Project name', initialValue: '', multiline: false },
  {
    id: 'description',
    title: 'Text area',
    label: 'Description',
    initialValue: 'A shared place for project notes.',
    multiline: true,
  },
  {
    id: 'handle',
    title: 'Invalid input',
    label: 'Project handle',
    initialValue: 'my project',
    multiline: false,
  },
  {
    id: 'summary',
    title: 'Invalid text area',
    label: 'Summary',
    initialValue: '',
    multiline: true,
  },
] as const;

function validationMessage(sample: (typeof samples)[number]['id'], value: string) {
  if (sample === 'handle' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Use lowercase letters, numbers and hyphens.';
  }
  if (sample === 'summary' && value.trim().length < 20) {
    return 'Add at least 20 characters.';
  }
  return undefined;
}

/** Temporary native-field prototypes for design selection, not public library components. */
export function FieldDesignProposals() {
  const prefix = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <>
      <Example title="Field design proposals">
        <Text variant="supporting">
          Try typing, focus and error recovery in either theme. These are documentation prototypes;
          Usage still describes the current library fields.
        </Text>
      </Example>
      {designs.map((design) => (
        <Example
          key={design.id}
          title={design.title}
          size="collection"
          className="docs-field-design"
        >
          <Text variant="supporting">{design.description}</Text>
          <div className="docs-field-proposal-grid">
            {samples.map((sample) => {
              const key = `${design.id}-${sample.id}`;
              const id = `${prefix}-${key}`;
              const value = values[key] ?? sample.initialValue;
              const error = validationMessage(sample.id, value);
              const controlProps = {
                id,
                className: 'docs-proposal-control',
                value,
                'aria-invalid': error ? (true as const) : undefined,
                'aria-describedby': error ? `${id}-error` : undefined,
                onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setValues((current) => ({ ...current, [key]: event.target.value })),
              };
              return (
                <Specimen key={sample.id} title={sample.title}>
                  <div
                    className="docs-proposal-field"
                    data-design={design.id}
                    data-filled={value.length > 0 || undefined}
                    data-invalid={!!error || undefined}
                  >
                    <div className="docs-proposal-well">
                      {sample.multiline ? (
                        <textarea {...controlProps} rows={3} />
                      ) : (
                        <input {...controlProps} type="text" autoComplete="off" />
                      )}
                      <label className="docs-proposal-label" htmlFor={id}>
                        {sample.label}
                      </label>
                    </div>
                    {error && (
                      <Text id={`${id}-error`} variant="supporting" className="docs-proposal-error">
                        <ErrorIcon aria-hidden="true" focusable="false" />
                        <span>{error}</span>
                      </Text>
                    )}
                  </div>
                </Specimen>
              );
            })}
          </div>
        </Example>
      ))}
    </>
  );
}
