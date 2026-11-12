import { Spinner } from '@envsemble/envui';

export default function SearchResultsLoading() {
  // Results whose number and shape aren't known until they arrive.
  return <Spinner label="Searching documents" showLabel />;
}
