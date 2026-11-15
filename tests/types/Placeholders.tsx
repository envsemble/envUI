import { isPlaceholder, placeholders, type Placeholder } from '@envsemble/envui';

interface Project {
  id: number;
  name: string;
  owner: { name: string };
}

declare const loaded: Project[] | undefined;

const items = loaded ?? placeholders<Project>(3);
const first = items[0];

export const id: string | number = first.id;
export const name: string | undefined = first.name;
// @ts-expect-error
export const placeholderNameMayBeMissing: string = first.name.toUpperCase();
// @ts-expect-error
export const placeholderOwnerMayBeMissing: string = first.owner.name;
export const safe: string | undefined = first.owner?.name.toUpperCase();
export const stand: Placeholder<Project> = placeholders<Project>(1)[0];
// @ts-expect-error
export const placeholderIdIsAStringWhateverTheItemId: number = stand.id;
export const known: boolean = isPlaceholder(first);
export const narrowedNameIsMissingOnlyOnAPlaceholder: string = isPlaceholder(first)
  ? (first.name ?? 'Loading')
  : first.name;
interface Note {
  id: string;
  text: string;
}
declare const note: Note | Placeholder<Note>;
export const stringIdItemIsNeverAPlaceholder: string = isPlaceholder(note) ? '' : note.text;
// @ts-expect-error
export const ownObjectIsNoPlaceholder: Placeholder<Note> = { id: 'envui-placeholder-0' };
