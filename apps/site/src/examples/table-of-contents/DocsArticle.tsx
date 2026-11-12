import { useRef } from 'react';
import {
  Column,
  Page,
  PageHeader,
  Row,
  TableOfContents,
  Text,
  useContainerSize,
} from '@envsemble/envui';

const sections = [
  {
    heading: 'Before you start',
    level: 4,
    text: 'You need an account and an invitation to a workspace. Ask its owner for one.',
  },
  {
    heading: 'Create a workspace',
    level: 4,
    text: 'A workspace holds your projects and your team. Name it after your organisation.',
  },
  {
    heading: 'Invite your team',
    level: 5,
    text: 'Add people by their email address. They join once they accept the invitation.',
  },
  {
    heading: 'Choose who can edit',
    level: 5,
    text: 'Editors change projects; viewers read them. You can change a role at any time.',
  },
  {
    heading: 'Import your projects',
    level: 4,
    text: 'Bring projects in from a file. Their tasks and documents come with them.',
  },
  {
    heading: 'Next steps',
    level: 4,
    text: 'Set up notifications and your profile, then open your first project.',
  },
];

export default function DocsArticle() {
  const frame = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement>(null);
  const size = useContainerSize(frame);
  // Beside the article from 36 rem; a narrower page leaves the contents out.
  const wide = (size?.inlineSize ?? 0) >= 36 * 16;
  return (
    // A box that scrolls stands in for the window; the header sticks at its top edge.
    <div
      ref={frame}
      tabIndex={0}
      role="region"
      aria-label="Onboarding guide"
      style={{ blockSize: '22rem', inlineSize: '100%', overflow: 'auto' }}
    >
      <Page width="md" header={<PageHeader headingLevel={3} sticky title="Onboarding guide" />}>
        <Row gap={6} align="start">
          <Column gap={6} render={<article ref={article} />} style={{ flex: 1, minInlineSize: 0 }}>
            {sections.map(({ heading, level, text }) => (
              <Column key={heading} gap={2}>
                <Text variant="title" render={level === 4 ? <h4 /> : <h5 />}>
                  {heading}
                </Text>
                <Text>{text}</Text>
              </Column>
            ))}
          </Column>
          {wide && (
            // The contents stay in view below the header as the article scrolls.
            <div style={{ position: 'sticky', insetBlockStart: '5rem', inlineSize: '12rem' }}>
              <TableOfContents
                aria-label="Sections of the guide"
                container={article}
                levels={[4, 5]}
              />
            </div>
          )}
        </Row>
      </Page>
    </div>
  );
}
