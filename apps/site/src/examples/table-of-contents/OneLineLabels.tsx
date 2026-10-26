import { TableOfContents } from '@envsemble/envui';

export default function OneLineLabels() {
  return (
    <TableOfContents
      aria-label="Sections of the billing guide, each on one line"
      style={{ inlineSize: '15rem' }}
      items={[
        { id: 'one-line-plans', label: 'Plans' },
        {
          id: 'one-line-invoices',
          label: 'Invoices',
          children: [
            { id: 'one-line-download', label: 'Download an invoice' },
            { id: 'one-line-address', label: 'Billing address' },
          ],
        },
        { id: 'one-line-cancel', label: 'Cancel a plan' },
      ]}
    />
  );
}
