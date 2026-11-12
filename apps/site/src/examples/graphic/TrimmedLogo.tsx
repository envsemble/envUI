import { Graphic, Row, Text } from '@envsemble/envui';

/** Stands in for the import of the logo file, trimmed to its drawing when it joined the app. */
const logo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#0d9488"/>' +
      '<circle cx="46" cy="18" r="8" fill="#fbbf24"/>' +
      '<path d="M6 58 26 30l12 16 8-10 12 22Z" fill="#fef3c7"/>' +
      '<path d="M18 58 36 38l18 20Z" fill="#f97316"/></svg>',
  );

export default function TrimmedLogo() {
  return (
    <Row align="center" gap={3}>
      <Graphic src={logo} alt="" size="lg" />
      <Text variant="headline" render={<span />}>
        Northwind
      </Text>
    </Row>
  );
}
