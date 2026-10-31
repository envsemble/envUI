import { Button, Graphic, Row } from '@envsemble/envui';

/** Stands in for the import of the company's logo file, such as `import logo from './logo.svg'`. */
const logo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#0d9488"/>' +
      '<circle cx="46" cy="18" r="8" fill="#fbbf24"/>' +
      '<path d="M6 58 26 30l12 16 8-10 12 22Z" fill="#fef3c7"/>' +
      '<path d="M18 58 36 38l18 20Z" fill="#f97316"/></svg>',
  );

/** The company's one-color mark, as its file draws it, in the brand's dark indigo. */
const mark =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 9 32 30">' +
      '<path fill="#1e1b4b" d="M24 9 40 39h-9l-7-14-7 14H8Zm-3 24h6l-3-6Z"/></svg>',
  );

export default function Colors() {
  return (
    <Row wrap align="center" gap={5}>
      <Graphic src={logo} alt="Northwind" size="md" />
      <Graphic src={mark} alt="Northwind" size="md" tint="text" />
      <Button variant="primary" startIcon={<Graphic src={mark} alt="" tint="text" />}>
        Connect Northwind
      </Button>
    </Row>
  );
}
