import { Input } from '@envsemble/envui';
import type { InputProps, MenuItemProps } from '@envsemble/envui';

// Type parameters, local types and namespaces hide the imports only from the types they declare.
export function generic<InputProps>(props: InputProps): InputProps {
  return props;
}

export type List<MenuItemProps> = MenuItemProps[];

export class Box<InputProps> {
  value!: InputProps;
}

export type Mapped<K extends string> = { [InputProps in K]: InputProps };

export type Unwrapped<T> = T extends Array<infer MenuItemProps> ? MenuItemProps : MenuItemProps;

declare namespace Local {
  type InputProps = number;
  const value: InputProps;
}

export function Field() {
  interface Input {
    label: string;
  }
  const props: Input = { label: 'Name' };
  return <Input {...props} />;
}

export function Labelled() {
  const Input = (props: InputProps) => props.label;
  const props: InputProps = { label: 'Name' };
  return Input(props);
}

export const item: MenuItemProps = { children: 'Members' };
