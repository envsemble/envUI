import { List, placeholders } from '@envsemble/envui';

export default function SkeletonOnRefresh() {
  // The activity people were reading, turned back into a skeleton while it refreshes.
  return (
    <List.Root aria-label="Team activity" skeleton style={{ inlineSize: '20rem' }}>
      {placeholders<{ text: string; when: string }>(3).map((item) => (
        <List.Item key={item.id} label={item.text} description={item.when} />
      ))}
    </List.Root>
  );
}
