import * as ui from '@envsemble/envui';
import { TextField, Menu } from '@envsemble/envui';

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
  type Name = typeof TextField.displayName;
  return null as unknown as [Name, Input];
}

export type Module = typeof ui.TextField;
export type Item = typeof ui.Menu.Item.displayName;
export type Name = typeof Menu.Item.displayName;
export const field = <TextField label="Name" />;
