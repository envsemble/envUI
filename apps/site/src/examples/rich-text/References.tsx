import {
  RichTextEditor,
  type RichTextReference,
  type RichTextReferenceSource,
} from '@envsemble/envui/rich-text';

const people: RichTextReference[] = [
  { id: 'person:alex', label: 'Alex Morgan', kind: 'person', href: '/people/alex' },
  { id: 'person:sam', label: 'Sam Lee', kind: 'person', href: '/people/sam' },
  { id: 'person:priya', label: 'Priya Shah', kind: 'person', href: '/people/priya' },
];
const topics: RichTextReference[] = [
  { id: 'topic:launch', label: 'Launch', kind: 'topic', href: '/topics/launch' },
  { id: 'topic:pricing', label: 'Pricing', kind: 'topic', href: '/topics/pricing' },
  { id: 'topic:support', label: 'Support', kind: 'topic', href: '/topics/support' },
];

/** Stands in for a search on a server: it answers after a moment, unless the query changes. */
function search(collection: RichTextReference[]): RichTextReferenceSource['search'] {
  return ({ query, signal }) =>
    new Promise((resolve) => {
      const timer = setTimeout(
        () =>
          resolve(
            collection.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
          ),
        300,
      );
      signal.addEventListener('abort', () => clearTimeout(timer));
    });
}

// At module scope, so the sources stay the same between renders.
const references: RichTextReferenceSource[] = [
  { trigger: '@', label: 'People', search: search(people) },
  { trigger: '#', label: 'Topics', search: search(topics) },
];

export default function References() {
  return (
    <RichTextEditor
      label="Comment"
      defaultValue="Thanks for the draft."
      placeholder="Type @ to mention someone, or # for a topic"
      references={references}
      toolbar={['bold', 'italic', 'link']}
    />
  );
}
