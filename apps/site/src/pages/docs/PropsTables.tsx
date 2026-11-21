import type { ReactNode } from 'react';
import { Column, Table, Text } from '@envsemble/envui';
import { PlainCode } from './SimpleTable';
import { DescriptionText, InlineText } from './InlineText';
import type { ExportEntry, PropEntry } from '../../documentation/DocumentationTypes';
import { nativePropsSentence, propDescription } from '../../documentation/PropWording';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { exportSection, propSection } from '../../documentation/SearchAnchors';
import { useSectionOutline } from '../../markdown/SectionOutline';

function alternatives(type: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let part = '';
  let inReturnType = false;
  for (const character of type) {
    if (quote) {
      if (character === quote) quote = '';
    } else if (character === "'" || character === '"' || character === '`') quote = character;
    else if (character === '>' && part.endsWith('=')) inReturnType ||= depth === 0;
    else if ('([{<'.includes(character)) depth += 1;
    else if (')]}>'.includes(character)) depth -= 1;
    else if (character === '|' && depth === 0 && !inReturnType) {
      parts.push(part.trim());
      part = '';
      continue;
    }
    part += character;
  }
  parts.push(part.trim());
  return parts.filter(Boolean);
}

function breakable(type: string): ReactNode[] {
  return type
    .split(/(?<=[.,:;|&([{<])/)
    .flatMap((part, index) => (index === 0 ? [part] : [<wbr key={index} />, part]));
}

function PropType({ type }: { type: string }) {
  const options = alternatives(type);
  if (options.length < 2) return <PlainCode>{breakable(type)}</PlainCode>;
  return (
    <span className="docs-prop-type">
      {options.map((option) => (
        <code key={option} className="docs-prop-option">
          {breakable(option)}
        </code>
      ))}
    </span>
  );
}

function PropDefault({ prop }: { prop: PropEntry }) {
  if (prop.default === undefined && !prop.defaultBuiltIn) return null;
  return (
    <Text render={<span />} variant="body-sm" emphasis="muted" className="docs-prop-default">
      Default {prop.default !== undefined ? <PlainCode>{prop.default}</PlainCode> : 'built-in'}
    </Text>
  );
}

function ExportProps({ name, entry }: { name: string; entry: ExportEntry }) {
  const outline = useSectionOutline();
  if (entry.kind === 'namespace') return null;
  const heading = (
    <Text render={<h3 />} variant="title" id={exportSection(name)}>
      {name}
    </Text>
  );
  if (outline) return heading;
  return (
    <Column render={<section />} gap={4} aria-labelledby={exportSection(name)}>
      {heading}
      {entry.description && (
        <Text>
          <InlineText text={entry.description} />
        </Text>
      )}
      {entry.kind === 'function' ? (
        <Text>
          <PlainCode>{`${name}${entry.signature}`}</PlainCode>
        </Text>
      ) : entry.props.length ? (
        <Table.Root
          aria-label={`${name} props`}
          className="docs-props-table"
          columnWidths={[26, 30, 44]}
          narrowLayout="stack"
          stackBelow="40rem"
        >
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Prop</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {entry.props.map((prop) => (
              <Table.Row key={prop.name} id={propSection(name, prop.name)}>
                <Table.Cell>
                  <span className="docs-prop-name">
                    <PlainCode>{prop.name}</PlainCode>
                    {prop.required && <span className="docs-prop-required">required</span>}
                  </span>
                  <PropDefault prop={prop} />
                </Table.Cell>
                <Table.Cell label="Type">
                  <PropType type={prop.type} />
                </Table.Cell>
                <Table.Cell label="Description">
                  <Text render={<div />} variant="body-sm" emphasis="muted">
                    <DescriptionText text={propDescription(prop, 'markdown')} />
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Text>{entry.native.length ? 'No props of its own.' : 'Takes no props.'}</Text>
      )}
      {entry.kind === 'component' && entry.native.length > 0 && (
        <Text emphasis="muted">{nativePropsSentence(entry.native, 'text')}</Text>
      )}
    </Column>
  );
}

export function PropsTables({ document }: { document: DocumentationEntry }) {
  return (
    <Column gap={7}>
      {Object.entries(document.props ?? {}).map(([name, entry]) => (
        <ExportProps key={name} name={name} entry={entry} />
      ))}
    </Column>
  );
}
