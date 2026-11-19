import { useRef } from 'react';
import { Column, Row, TableOfContents, Text, useContainerSize } from '@envsemble/envui';

const sections = [
  {
    heading: 'Before you start',
    level: 3,
    text: 'You need an account and an invitation to a workspace. Ask its owner for one.',
  },
  {
    heading: 'Create a workspace',
    level: 3,
    text: 'A workspace holds your projects and your team. Name it after your organisation.',
  },
  {
    heading: 'Invite your team',
    level: 4,
    text: 'Add people by their email address. They join once they accept the invitation.',
  },
  {
    heading: 'Choose who can edit',
    level: 4,
    text: 'Editors change projects; viewers read them. You can change a role at any time.',
  },
  {
    heading: 'Import your projects',
    level: 3,
    text: 'Bring projects in from a file. Their tasks and documents come with them.',
  },
  {
    heading: 'Next steps',
    level: 3,
    text: 'Set up notifications and your profile, then open your first project.',
  },
];

const contentsBesideArticleFromPx = 30 * 16;

export default function DocsArticle() {
  const frame = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement>(null);
  const size = useContainerSize(frame);
  const beside = (size?.inlineSize ?? 0) >= contentsBesideArticleFromPx;
  const Stack = beside ? Row : Column;
  const contents = (
    <TableOfContents
      aria-label="Sections of the guide"
      container={article}
      levels={[3, 4]}
      style={
        beside ? { position: 'sticky', insetBlockStart: 0, inlineSize: '11rem', flexShrink: 0 } : {}
      }
    />
  );
  return (
    <div
      ref={frame}
      tabIndex={0}
      role="region"
      aria-label="Getting started"
      style={{ blockSize: '20rem', inlineSize: '100%', overflow: 'auto' }}
    >
      <Stack gap={beside ? 6 : 5} align={beside ? 'start' : 'stretch'}>
        {size && !beside && contents}
        <Column gap={5} render={<article ref={article} />} style={{ flex: 1, minInlineSize: 0 }}>
          {sections.map(({ heading, level, text }) => (
            <Column key={heading} gap={2}>
              <Text variant="title" render={level === 3 ? <h3 /> : <h4 />}>
                {heading}
              </Text>
              <Text>{text}</Text>
            </Column>
          ))}
        </Column>
        {beside && contents}
      </Stack>
    </div>
  );
}
