// Type tests: placeholders() says what a stand-in item is, an id and every other field possibly
// missing, so code that reads a field must handle its absence. Each expected error below must
// occur; the other lines must type-check.
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
// @ts-expect-error A placeholder's name may be missing.
export const shout: string = first.name.toUpperCase();
// @ts-expect-error A placeholder's owner may be missing.
export const owner: string = first.owner.name;
export const safe: string | undefined = first.owner?.name.toUpperCase();
export const stand: Placeholder<Project> = placeholders<Project>(1)[0];
// @ts-expect-error A placeholder's id is a string, whatever the item's id is.
export const numeric: number = stand.id;
export const known: boolean = isPlaceholder(first);
// isPlaceholder narrows: a stand-in's name may be missing, a loaded item's never is.
export const label: string = isPlaceholder(first) ? (first.name ?? 'Loading') : first.name;
interface Note {
  id: string;
  text: string;
}
declare const note: Note | Placeholder<Note>;
// With string ids too, an item is never taken for a stand-in.
export const text: string = isPlaceholder(note) ? '' : note.text;
// @ts-expect-error An object of the application's own is no placeholder.
export const made: Placeholder<Note> = { id: 'envui-placeholder-0' };
