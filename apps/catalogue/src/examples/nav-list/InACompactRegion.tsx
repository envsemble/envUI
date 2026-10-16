import { useState } from 'react';
import { NavList, Theme, useTheme } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const documents = [
  { href: '/documents/quarterly-report', title: 'Quarterly report' },
  { href: '/documents/meeting-notes', title: 'Meeting notes' },
  { href: '/documents/budget', title: 'Budget for the second half' },
  { href: '/documents/roadmap', title: 'Roadmap' },
  { href: '/documents/hiring-plan', title: 'Hiring plan' },
];

export default function InACompactRegion() {
  const [current, setCurrent] = useState('/documents/meeting-notes');
  // The region keeps the surrounding color scheme and contrast, at the compact scale.
  return (
    <Theme {...useTheme()} scale="compact">
      <nav aria-label="Recent documents">
        <NavList.Root>
          <NavList.Group label="Recent">
            {documents.map((document) => (
              <NavList.Item
                key={document.href}
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
    </Theme>
  );
}
