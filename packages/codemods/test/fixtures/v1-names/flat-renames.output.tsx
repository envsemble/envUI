import {
  Button,
  DatePicker,
  DiffStat,
  Disclosure,
  DropZone,
  CalendarHeatmap,
  TextField,
  Alert,
  OrganizationSwitcher,
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
  OrganizationSwitcherItem,
  OrganizationSwitcherProps,
} from '@envsemble/envui';

const organizations: OrganizationSwitcherItem[] = [
  { id: 'northwind', name: 'Northwind Labs' },
  { id: 'contoso', name: 'Contoso' },
];

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
  switcher?: OrganizationSwitcherProps;
}

type DiffComponent = typeof DiffStat;

export function ProfileForm({ name, start, upload, tone }: ProfileFormProps) {
  return (
    <form>
      <OrganizationSwitcher organizations={organizations} />
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
