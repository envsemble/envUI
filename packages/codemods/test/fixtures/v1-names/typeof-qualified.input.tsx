import * as ui from '@envsemble/envui';
import { Input, MenuItem } from '@envsemble/envui';

// A typeof query reads the first name of a qualified name as a value, which a local value hides.
export function local() {
  const ui = { Input: 1 };
  const Input = { label: 'Name' };
  type Field = typeof ui.Input;
  type Label = typeof Input.label;
  return [ui, Input] as unknown as [Field, Label];
}

// A local interface hides the import from types, but not from a typeof query.
export function typesOnly() {
  interface Input {
    label: string;
  }
  type Name = typeof Input.displayName;
  return null as unknown as [Name, Input];
}

export type Module = typeof ui.Input;
export type Item = typeof ui.MenuItem.displayName;
export type Name = typeof MenuItem.displayName;
export const field = <Input label="Name" />;
