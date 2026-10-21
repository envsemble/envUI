import {
  Button,
  DateTimeField,
  DiffCount,
  DisclosureNote,
  FileDropzone,
  Heatmap,
  Input,
  Notice,
  OrganizationMenu,
} from '@envsemble/envui';
import type {
  CounterProps,
  DateTimeFieldProps,
  DiffCountProps,
  DisclosureNoteProps,
  FileDropzoneProps,
  HeatmapCell,
  HeatmapDay,
  HeatmapProps,
  InputProps,
  NoticeProps,
  NoticeTone,
  OrganizationMenuOrganization,
  OrganizationMenuProps,
} from '@envsemble/envui';

const organizations: OrganizationMenuOrganization[] = [
  { id: 'northwind', name: 'Northwind Labs' },
  { id: 'contoso', name: 'Contoso' },
];

export const fields = { Input, DateTimeField, FileDropzone };

export interface ProfileFormProps {
  name: InputProps;
  start: DateTimeFieldProps;
  upload: FileDropzoneProps;
  disclosure?: DisclosureNoteProps;
  tone: NoticeTone;
  notice?: NoticeProps;
  counter?: CounterProps;
  diff?: DiffCountProps;
  heatmap?: HeatmapProps;
  days?: HeatmapDay[];
  cell?: HeatmapCell;
  switcher?: OrganizationMenuProps;
}

type DiffComponent = typeof DiffCount;

export function ProfileForm({ name, start, upload, tone }: ProfileFormProps) {
  return (
    <form>
      <OrganizationMenu organizations={organizations} />
      <Notice tone={tone} title="Profile">
        Alex Morgan updated the profile.
      </Notice>
      <Input {...name} label="Name" />
      <DateTimeField {...start} />
      <FileDropzone {...upload} />
      <DisclosureNote summary="Details">Owned by Contoso.</DisclosureNote>
      <DiffCount additions={12} deletions={4} />
      <Heatmap days={[]} />
      <Button type="submit">Save</Button>
    </form>
  );
}

export type { DiffComponent };
