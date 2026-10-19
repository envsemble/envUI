import { TextField } from '@envsemble/envui';
import type { TextFieldProps, Menu } from '@envsemble/envui';

// Type parameters, local types and namespaces hide the imports only from the types they declare.
export function generic<InputProps>(props: InputProps): InputProps {
  return props;
}

export type List<MenuItemProps> = MenuItemProps[];

export class Box<InputProps> {
  value!: InputProps;
}

export type Mapped<K extends string> = { [InputProps in K]: InputProps };

export type Unwrapped<T> = T extends Array<infer MenuItemProps> ? MenuItemProps : Menu.ItemProps;

declare namespace Local {
  type InputProps = number;
  const value: InputProps;
}

export function Field() {
  interface Input {
    label: string;
  }
  const props: Input = { label: 'Name' };
  return <TextField {...props} />;
}

export function Labelled() {
  const Input = (props: TextFieldProps) => props.label;
  const props: TextFieldProps = { label: 'Name' };
  return Input(props);
}

export const item: Menu.ItemProps = { children: 'Members' };
