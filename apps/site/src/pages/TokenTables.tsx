import type { ReactNode } from 'react';
import { Column, Text, type TableOfContentsItem } from '@envsemble/envui';
import tokenOutline from 'virtual:envui-token-outline';
import { PlainCode, SimpleTable, type SimpleRow } from './SimpleTable';
import { LongPartSkeleton, placeholderText } from '../loading/Skeletons';
import { recordedSize } from '../loading/RecordedSizes';
import { themes } from './TokenGroups';

/*
 * The frame of the token reference: its opening words and a table under a heading for each group
 * of tokens. The reference (TokenReference.tsx) fills it with every token, and loads with the page
 * that shows it; until it has, the frame shows the same headings, which the page's contents list
 * from the start, over each table as a skeleton of its rows (virtual:envui-token-outline).
 */

/** The id of a group's heading. */
const groupHeading = (title: string) => `tokens-${title}`;

/**
 * The sections of the token reference: a heading for each group, the same while it loads and once
 * it has (virtual:envui-token-outline holds the groups that have tokens).
 */
export const tokenContents = (): TableOfContentsItem[] =>
  tokenOutline.map(({ title }) => ({ id: groupHeading(title), label: title }));

/** The reference's opening words. */
export function TokenIntro() {
  return (
    <Text>
      Each token is a CSS custom property on every envUI theme boundary. Use the semantic names in
      application styles; the values change with the theme, the contrast and the scale.
    </Text>
  );
}

/** A group's columns: colors with their value in each theme, other tokens at each scale. */
const columnsOf = (colors: boolean) =>
  colors
    ? [
        { title: 'Token', width: '36%' },
        ...themes.map(([, label]) => ({ title: label, width: '16%' })),
      ]
    : [
        { title: 'Token', width: '50%' },
        { title: 'Comfortable', width: '25%' },
        { title: 'Compact', width: '25%' },
      ];

/** A token's name in plain monospace, with what it is for below in small muted text. */
export function TokenName({ name, description }: { name: string; description?: ReactNode }) {
  return (
    <>
      <PlainCode name>{name}</PlainCode>
      {description && <span className="docs-token-description">{description}</span>}
    </>
  );
}

/** How many rows of a group's table its skeleton shows. */
const skeletonRows = 6;

/**
 * A group of tokens under its heading, as a simple table; `loading`, as a skeleton of its first
 * rows under the heading itself, in the room the group was recorded to take (RecordPartSizes.ts),
 * or else that of all its rows.
 */
export function TokenTable({
  title,
  colors,
  rows,
  loading = false,
}: {
  title: string;
  colors: boolean;
  rows: SimpleRow[];
  loading?: boolean;
}) {
  const size = loading ? recordedSize(`tokens:${title}`) : undefined;
  const table = (shown: SimpleRow[]) => (
    <SimpleTable label={`${title} tokens`} columns={columnsOf(colors)} rows={shown} />
  );
  return (
    <Column
      render={<section />}
      gap={4}
      aria-labelledby={groupHeading(title)}
      style={size && { blockSize: `${size[1]}rem` }}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id={groupHeading(title)}>
        {title}
      </Text>
      {loading ? (
        <LongPartSkeleton
          what="the token reference"
          start={table(rows.slice(0, skeletonRows))}
          whole={!size && table(rows)}
        />
      ) : (
        table(rows)
      )}
    </Column>
  );
}

/** A value of a row that hasn't loaded: text of its length, as the skeleton's bar. */
const placeholderValue = (length: number, key: number) => (
  <span key={key} className="docs-token-value">
    <PlainCode>{placeholderText(length)}</PlainCode>
  </span>
);

/**
 * The reference while it loads: its words, and each group's heading over a skeleton of its table,
 * a row for each token with its name, and bars as long as its description and values.
 */
export function TokenReferenceSkeleton() {
  return (
    <>
      <TokenIntro />
      {tokenOutline.map(({ title, colors, rows }) => (
        <TokenTable
          key={title}
          title={title}
          colors={colors}
          loading
          rows={rows.map(([name, description, ...values]) => ({
            key: name,
            cells: [
              <TokenName
                key="name"
                name={name}
                description={description ? placeholderText(description) : undefined}
              />,
              ...values.map(placeholderValue),
            ],
          }))}
        />
      ))}
    </>
  );
}
