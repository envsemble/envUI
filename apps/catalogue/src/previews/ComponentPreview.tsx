import { ChipsPreview } from './Content';

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'chips':
      return <ChipsPreview />;
    default:
      return null;
  }
}
