import { CloseButton, EnvUIProvider, Stack } from '@envsemble/envui';

export default function ApplicationLabel() {
  return (
    // An application sets envUI's strings once, for every component inside, in the reader's language.
    <EnvUIProvider messages={{ common: { close: 'Dismiss' } }}>
      <Stack direction="row" gap={2}>
        <CloseButton />
        <CloseButton variant="secondary" />
      </Stack>
    </EnvUIProvider>
  );
}
