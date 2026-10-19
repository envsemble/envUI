import { TextField as Input } from '@envsemble/envui';
import type { TextFieldProps as InputProps } from '@envsemble/envui';

// A type parameter named as the new name would capture the renamed reference, so the import keeps
// its old name as an alias.
export function field<TextFieldProps>(props: InputProps, extra: TextFieldProps) {
  return <Input {...props} {...extra} />;
}

export type Mapped<K extends string> = { [TextField in K]: InputProps };
