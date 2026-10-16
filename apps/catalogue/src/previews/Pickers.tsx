import { useState } from 'react';
import {
  ActionGroup,
  Button,
  Calendar,
  DatePicker,
  Kbd,
  Stack,
  Surface,
  Text,
} from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function DatePickerPreview() {
  const [publishOn, setPublishOn] = useState<string | null>('2026-10-20');
  const [meeting, setMeeting] = useState<string | null>('2026-10-21T09:30');
  const [day, setDay] = useState<string | null>(null);
  return (
    <Preview>
      <Example
        title="A date, or a date and time"
        size="collection"
        caption={
          <>
            Press a field or <Kbd>↓</Kbd> to open its calendar. <Kbd>←</Kbd> <Kbd>→</Kbd>{' '}
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move by day and week, <Kbd>Page Up</Kbd> and{' '}
            <Kbd>Page Down</Kbd> by month, and <Kbd>Enter</Kbd> chooses.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen title="Date">
            <DatePicker
              label="Publish on"
              value={publishOn}
              onValueChange={setPublishOn}
              hint="The day the report goes out."
              clearable
            />
          </Specimen>
          <Specimen title="Date and time">
            <DatePicker
              label="Meeting"
              withTime
              defaultTime="09:00"
              value={meeting}
              onValueChange={setMeeting}
              clearable
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Compact & limits"
        size="collection"
        caption="min and max make the days outside them unavailable."
      >
        <SpecimenGrid>
          <Specimen title="In a compact toolbar">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              density="compact"
              role="group"
              aria-label="Schedule toolbar"
              render={<ActionGroup />}
            >
              <DatePicker density="compact" aria-label="Due" placeholder="Due" withTime clearable />
              <Button variant="outlined">Schedule</Button>
            </Surface>
          </Specimen>
          <Specimen title="Within a range">
            <DatePicker
              label="Review by"
              min="2026-10-01"
              max="2026-12-31"
              placeholder="Choose a day"
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Validation & availability" size="collection">
        <SpecimenGrid>
          <Specimen title="Invalid">
            <DatePicker label="Ends" required error="Choose a day after the start." />
          </Specimen>
          <Specimen title="Read only">
            <DatePicker label="Created" defaultValue="2026-09-30T16:45" withTime readOnly />
          </Specimen>
          <Specimen title="Disabled">
            <DatePicker label="Archived on" defaultValue="2026-08-14" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Calendar on its own" size="field">
        <Stack gap={3}>
          <Calendar aria-label="Planning" value={day} onValueChange={setDay} />
          <Text variant="caption" aria-live="polite">
            {day ? `Chosen: ${day}` : 'No day chosen yet.'}
          </Text>
        </Stack>
      </Example>
    </Preview>
  );
}
