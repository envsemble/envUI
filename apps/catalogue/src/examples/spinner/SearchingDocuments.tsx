import { Spinner } from '@envsemble/envui';

export default function SearchingDocuments() {
  // Results whose number and shape aren't known until they arrive.
  return <Spinner label="Searching documents" showLabel />;
}
