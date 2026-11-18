import type { ReactNode } from 'react';
import { Column, Text, type TableOfContentsItem } from '@envsemble/envui';
import tokenOutline from 'virtual:envui-token-outline';
import { PlainCode, SimpleTable, type SimpleRow } from './SimpleTable';
import { LongPartSkeleton, placeholderText } from '../../loading/Skeletons';
import { recordedSize } from '../../loading/RecordedSizes';
import { themes } from './TokenGroups';

const groupHeading = (title: string) => `tokens-${title}`;

export const tokenContents = (): TableOfContentsItem[] =>
  tokenOutline.map(({ title }) => ({ id: groupHeading(title), label: title }));

export function TokenIntro() {
  return (
    <Text>
      Each token is a CSS custom property on every envUI theme boundary. Use the semantic names in
      application styles; the values change with the theme, the contrast and the scale.
    </Text>
  );
}

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

export function TokenName({ name, description }: { name: string; description?: ReactNode }) {
  return (
    <>
      <PlainCode name>{name}</PlainCode>
      {description && <span className="docs-token-description">{description}</span>}
    </>
  );
}

const skeletonRows = 6;

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

const placeholderValue = (length: number, key: number) => (
  <span key={key} className="docs-token-value">
    <PlainCode>{placeholderText(length)}</PlainCode>
  </span>
);

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
