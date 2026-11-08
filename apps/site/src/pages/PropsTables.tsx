import type { ReactNode } from 'react';
import { Column, Table, Text } from '@envsemble/envui';
import { PlainCode } from './SimpleTable';
import type { ExportEntry, PropEntry } from '../shared/DocumentationTypes';
import type { Documentation } from './PageModel';
// The ids search leads to, as the search index writes them.
import { exportSection, propSection } from '../shared/SearchAnchors';
import { useSectionOutline } from '../template/SectionOutline';

/** The same sentences as the packaged Markdown's Props section (scripts/docs/GenerateDocumentation.ts). */
function nativeSentence(elements: string[]) {
  if (!elements.length) return null;
  const tags = elements.map((element) =>
    element === 'element' ? 'an HTML element' : `<${element}>`,
  );
  const list = tags.length === 1 ? tags[0] : `${tags.slice(0, -1).join(', ')} or ${tags.at(-1)}`;
  return `Also accepts the native props of ${list}, such as ref, className and aria-* attributes.`;
}

function description(prop: PropEntry) {
  return [
    prop.deprecated ? `Deprecated${prop.deprecated === true ? '' : `: ${prop.deprecated}`}.` : '',
    prop.requiredWhen
      ? prop.requiredWhen === 'in some forms'
        ? 'Required in some forms.'
        : `Required when ${prop.requiredWhen.replaceAll('`', '')}.`
      : '',
    prop.source === 'base-ui' ? 'Passed to Base UI.' : '',
    prop.description,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * A type's top-level alternatives, such as 'sm' | 'md' | 'lg', split at the bars outside brackets,
 * quotes and parentheses; a function, object or generic type stays whole, and an arrow's > closes
 * no bracket.
 */
function alternatives(type: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let part = '';
  // After a function's arrow outside brackets, the rest is its return type, which stays whole.
  let returnType = false;
  for (const character of type) {
    if (quote) {
      if (character === quote) quote = '';
    } else if (character === "'" || character === '"' || character === '`') quote = character;
    else if (character === '>' && part.endsWith('=')) returnType ||= depth === 0;
    else if ('([{<'.includes(character)) depth += 1;
    else if (')]}>'.includes(character)) depth -= 1;
    else if (character === '|' && depth === 0 && !returnType) {
      parts.push(part.trim());
      part = '';
      continue;
    }
    part += character;
  }
  parts.push(part.trim());
  return parts.filter(Boolean);
}

/**
 * A type's text with a break opportunity after each dot, comma, opening bracket, colon and bar, so
 * a type longer than its column wraps between its parts, such as after React., rather than inside
 * a name.
 */
function breakable(type: string): ReactNode[] {
  return type
    .split(/(?<=[.,:;|&([{<])/)
    .flatMap((part, index) => (index === 0 ? [part] : [<wbr key={index} />, part]));
}

/**
 * A prop's type: each alternative of a union as its own small tag, so they wrap whole; a type or
 * tag longer than the column wraps inside it.
 */
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

/** A prop's default, under its name, or nothing when it has none. */
function PropDefault({ prop }: { prop: PropEntry }) {
  if (prop.default === undefined && !prop.defaultBuiltIn) return null;
  return (
    <Text render={<span />} variant="body-sm" emphasis="muted" className="docs-prop-default">
      Default {prop.default !== undefined ? <PlainCode>{prop.default}</PlainCode> : 'built-in'}
    </Text>
  );
}

function ExportProps({ name, entry }: { name: string; entry: ExportEntry }) {
  // Waiting its turn to show, an export's props are its heading alone (SectionOutline).
  const outline = useSectionOutline();
  if (entry.kind === 'namespace') return null;
  // The export's name in the heading style of the page's other h3s, not as code, so the long Props
  // section has landmarks.
  const heading = (
    <Text render={<h3 />} variant="title" id={exportSection(name)}>
      {name}
    </Text>
  );
  if (outline) return heading;
  return (
    <Column render={<section />} gap={4} aria-labelledby={exportSection(name)}>
      {heading}
      {entry.description && <Text>{entry.description}</Text>}
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
              // Search leads to a prop's row: props-Button-variant.
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
                  <Text render={<span />} variant="body-sm" emphasis="muted">
                    {description(prop)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Text>{entry.native.length ? 'No props of its own.' : 'Takes no props.'}</Text>
      )}
      {entry.kind === 'component' && nativeSentence(entry.native) && (
        <Text emphasis="muted">{nativeSentence(entry.native)}</Text>
      )}
    </Column>
  );
}

/** The Props view: every component and part the page documents, generated from their types. */
export function PropsTables({ document }: { document: Documentation }) {
  return (
    <Column gap={7}>
      {Object.entries(document.props ?? {}).map(([name, entry]) => (
        <ExportProps key={name} name={name} entry={entry} />
      ))}
    </Column>
  );
}
