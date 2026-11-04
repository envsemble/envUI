import { Column, Graphic, List } from '@envsemble/envui';

/** Stands in for a photo from the application's data, such as a project's cover image. */
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#bae6fd"/>' +
      '<circle cx="300" cy="80" r="36" fill="#fde68a"/>' +
      '<path d="M0 300 120 140l90 100 70-70 120 130Z" fill="#0f766e"/>' +
      '<path d="M0 300 80 230l70 70Z" fill="#134e4a"/></svg>',
  );

export default function PhotoThumbnails() {
  return (
    <Column gap={4} style={{ inlineSize: '18rem' }}>
      <Graphic src={photo} alt="The coast at dawn" size="fill" aspect="16/9" fit="cover" />
      <List.Root aria-label="Photos">
        <List.Item
          start={<Graphic src={photo} alt="" size="lg" aspect="4/3" fit="cover" />}
          label="Coast at dawn"
          description="Added 12 March 2026"
        />
      </List.Root>
    </Column>
  );
}
