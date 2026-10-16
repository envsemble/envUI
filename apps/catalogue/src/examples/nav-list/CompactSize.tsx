import { useState } from 'react';
import { NavList } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const documents = [
  { href: '/documents/quarterly-report', title: 'Quarterly report' },
  { href: '/documents/meeting-notes', title: 'Meeting notes' },
  { href: '/documents/budget', title: 'Budget for the second half' },
  { href: '/documents/roadmap', title: 'Roadmap' },
  { href: '/documents/hiring-plan', title: 'Hiring plan' },
];

export default function CompactSize() {
  const [current, setCurrent] = useState('/documents/meeting-notes');
  return (
    <nav aria-label="Recent documents">
      <NavList.Root>
        <NavList.Group label="Recent">
          {documents.map((document) => (
            <NavList.Item
              key={document.href}
              size="compact"
              href={document.href}
              selected={current === document.href}
              onClick={() => setCurrent(document.href)}
              icon={<Description />}
            >
              {document.title}
            </NavList.Item>
          ))}
        </NavList.Group>
      </NavList.Root>
    </nav>
  );
}
