import {
  Button,
  DatePicker,
  DiffStat,
  Disclosure,
  DropZone,
  CalendarHeatmap,
  TextField,
  Alert,
} from '@envsemble/envui';
import type {
  BadgeProps,
  DatePickerProps,
  DiffStatProps,
  DisclosureProps,
  DropZoneProps,
  CalendarHeatmapCell,
  CalendarHeatmapDay,
  CalendarHeatmapProps,
  TextFieldProps,
  AlertProps,
  AlertTone,
} from '@envsemble/envui';

export const fields = { Input: TextField, DateTimeField: DatePicker, FileDropzone: DropZone };

export interface ProfileFormProps {
  name: TextFieldProps;
  start: DatePickerProps;
  upload: DropZoneProps;
  disclosure?: DisclosureProps;
  tone: AlertTone;
  notice?: AlertProps;
  counter?: BadgeProps;
  diff?: DiffStatProps;
  heatmap?: CalendarHeatmapProps;
  days?: CalendarHeatmapDay[];
  cell?: CalendarHeatmapCell;
}

type DiffComponent = typeof DiffStat;

export function ProfileForm({ name, start, upload, tone }: ProfileFormProps) {
  return (
    <form>
      <Alert tone={tone} title="Profile">
        Alex Morgan updated the profile.
      </Alert>
      <TextField {...name} label="Name" />
      <DatePicker {...start} />
      <DropZone {...upload} />
      <Disclosure summary="Details">Owned by Contoso.</Disclosure>
      <DiffStat additions={12} deletions={4} />
      <CalendarHeatmap days={[]} />
      <Button type="submit">Save</Button>
    </form>
  );
}

export type { DiffComponent };
