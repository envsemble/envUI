import { TableOfContents } from '@envsemble/envui';

export default function WrappingLabels() {
  return (
    <TableOfContents
      aria-label="Sections of the billing guide, squeezed onto two lines"
      style={{ inlineSize: '9rem' }}
      items={[
        { id: 'wrapping-plans', label: 'Plans' },
        {
          id: 'wrapping-invoices',
          label: 'Invoices',
          children: [
            { id: 'wrapping-download', label: 'Download an invoice' },
            { id: 'wrapping-address', label: 'Billing address' },
          ],
        },
        { id: 'wrapping-cancel', label: 'Cancel a plan' },
      ]}
    />
  );
}
