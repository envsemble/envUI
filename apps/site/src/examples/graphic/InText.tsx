import { Column, Graphic, Text } from '@envsemble/envui';

/** The company's one-color mark as an SVG component of the application's own. */
function NorthwindMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="8 9 32 30">
      <path d="M24 9 40 39h-9l-7-14-7 14H8Zm-3 24h6l-3-6Z" />
    </svg>
  );
}

export default function InText() {
  return (
    <Column gap={3}>
      <Text>
        Connect{' '}
        <Graphic size="text" alt="" tint="text">
          <NorthwindMark />
        </Graphic>{' '}
        Northwind to sync your invoices every night.
      </Text>
      <Text variant="headline" render={<h3 />}>
        <Graphic size="text" alt="" tint="text">
          <NorthwindMark />
        </Graphic>{' '}
        Northwind invoices
      </Text>
    </Column>
  );
}
