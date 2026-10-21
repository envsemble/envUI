import { LoadingState } from '@envsemble/envui';

export default function SearchResultsLoading() {
  // Results whose number and shape aren't known until they arrive.
  return <LoadingState label="Searching documents" />;
}
