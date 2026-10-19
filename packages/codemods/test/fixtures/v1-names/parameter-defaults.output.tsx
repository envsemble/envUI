import { TextField } from '@envsemble/envui';

// A parameter default does not see the function body's var, which hides the import only there.
export function field(element = <TextField label="Name" />) {
  var Input = element;
  return Input;
}
