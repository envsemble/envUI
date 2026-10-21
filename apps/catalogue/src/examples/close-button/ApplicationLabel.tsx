import { CloseButton, EnvUIProvider, Row } from '@envsemble/envui';

export default function ApplicationLabel() {
  return (
    // An application sets envUI's strings once, for every component inside, in the reader's language.
    <EnvUIProvider messages={{ common: { close: 'Dismiss' } }}>
      <Row gap={2}>
        <CloseButton />
        <CloseButton variant="secondary" />
      </Row>
    </EnvUIProvider>
  );
}
