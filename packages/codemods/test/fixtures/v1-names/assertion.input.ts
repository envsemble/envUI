import { Input, type InputProps } from '@envsemble/envui';

const defaults = <InputProps>{ label: 'Name' };
const identity = <T>(value: T) => value;

export const field = identity(Input);
export { defaults };
