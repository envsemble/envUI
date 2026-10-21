import { LoadingState } from '@envsemble/envui';

export default function SearchingDocuments() {
  // Results whose number and shape aren't known until they arrive.
  return <LoadingState label="Searching documents" />;
}
