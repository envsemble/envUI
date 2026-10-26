import { Spinner } from '@envsemble/envui';

export default function SpinnerInPlace() {
  // A spinner where a list of members of a known shape will appear: the page jumps when it lands.
  return <Spinner label="Loading members" showLabel style={{ inlineSize: 'min(100%, 20rem)' }} />;
}
