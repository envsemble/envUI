import { TextField, type TextFieldProps } from '@envsemble/envui';

const defaults = <TextFieldProps>{ label: 'Name' };
const identity = <T>(value: T) => value;

export const field = identity(TextField);
export { defaults };
