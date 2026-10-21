import { PageHeader } from '@envsemble/envui';

export default function NameTheContent() {
  return (
    <PageHeader
      headingLevel={3}
      title="Invoices"
      description="Sent to customers in the last twelve months."
    />
  );
}
