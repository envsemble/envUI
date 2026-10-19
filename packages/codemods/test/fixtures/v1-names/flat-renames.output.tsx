import {
  Button,
  CounterBadge,
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
  CounterBadgeProps,
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
  counter?: CounterBadgeProps;
  diff?: DiffStatProps;
  heatmap?: CalendarHeatmapProps;
  days?: CalendarHeatmapDay[];
  cell?: CalendarHeatmapCell;
  switcher?: OrganizationSwitcherProps;
}

type CounterComponent = typeof CounterBadge;

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
      <CounterBadge value={3} />
      <DiffStat additions={12} deletions={4} />
      <CalendarHeatmap days={[]} />
      <Button type="submit">Save</Button>
    </form>
  );
}

export type { CounterComponent };
