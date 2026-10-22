import {
  Button,
  DateTimeField,
  DiffCount,
  DisclosureNote,
  FileDropzone,
  Heatmap,
  Input,
  Notice,
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
} from '@envsemble/envui';

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
}

type DiffComponent = typeof DiffCount;

export function ProfileForm({ name, start, upload, tone }: ProfileFormProps) {
  return (
    <form>
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
