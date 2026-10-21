import { LoadingState } from '@envsemble/envui';

export default function SpinnerInPlace() {
  // A spinner where a list of members of a known shape will appear: the page jumps when it lands.
  return <LoadingState label="Loading members" style={{ inlineSize: '20rem' }} />;
}
