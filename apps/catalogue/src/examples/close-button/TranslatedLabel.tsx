import { CloseButton, EnvUIProvider, Stack } from '@envsemble/envui';

export default function TranslatedLabel() {
  return (
    // An application that translates sets envUI's strings once, for every component inside.
    <EnvUIProvider locale="de-DE" messages={{ common: { close: 'Schließen' } }}>
      <Stack direction="row" gap={2}>
        <CloseButton />
        <CloseButton variant="secondary" />
      </Stack>
    </EnvUIProvider>
  );
}
