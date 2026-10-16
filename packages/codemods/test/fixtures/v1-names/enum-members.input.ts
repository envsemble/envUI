import { Input } from '@envsemble/envui';

// Inside an enum, its members are in scope by their names.
export enum Field {
  Input = 1,
  Default = Input,
}

export const component = Input;
