import { Link, Stack, Table, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import type { ExportEntry, PropEntry } from '../DocumentationTypes';
import type { Reference } from '../Reference';

/** The same sentences as the packaged Markdown's Props section (scripts/GenerateDocumentation.mjs). */
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

function ExportProps({ name, entry }: { name: string; entry: ExportEntry }) {
  if (entry.kind === 'namespace') return null;
  return (
    <Stack as="section" gap={4} aria-labelledby={`props-${name}`}>
      <Text as="h2" variant="section-heading" id={`props-${name}`}>
        <Code>{name}</Code>
      </Text>
      {entry.description && <Text>{entry.description}</Text>}
      {entry.kind === 'function' ? (
        <Text>
          <Code>{`${name}${entry.signature}`}</Code>
        </Text>
      ) : entry.props.length ? (
        <Table.Root aria-label={`${name} props`} narrowLayout="stack" stackBelow="40rem">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Prop</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Default</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {entry.props.map((prop) => (
              <Table.Row key={prop.name}>
                <Table.Cell label="Prop" nowrap>
                  <Code className="docs-prop-code">{prop.name}</Code>
                  {prop.required && <Text variant="caption"> required</Text>}
                </Table.Cell>
                <Table.Cell label="Type">
                  <Code className="docs-prop-code">{prop.type}</Code>
                </Table.Cell>
                <Table.Cell label="Default" nowrap>
                  {prop.default !== undefined ? (
                    <Code className="docs-prop-code">{prop.default}</Code>
                  ) : (
                    '—'
                  )}
                </Table.Cell>
                <Table.Cell label="Description">{description(prop)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Text>{entry.native.length ? 'No props of its own.' : 'Takes no props.'}</Text>
      )}
      {entry.kind === 'component' && nativeSentence(entry.native) && (
        <Text tone="muted">{nativeSentence(entry.native)}</Text>
      )}
    </Stack>
  );
}

/** The Props view: every component and part the page documents, generated from their types. */
export function PropsTables({ reference }: { reference: Reference }) {
  const sources = [...new Set(Object.values(reference.props ?? {}).map(({ source }) => source))];
  return (
    <Stack gap={7}>
      <Text tone="muted">
        Generated from the TypeScript source,{' '}
        {sources.map((source, index) => (
          <span key={source}>
            {index > 0 && ', '}
            <Link href={`https://github.com/envsemble/envUI/blob/main/${source}`}>
              {source.replace('packages/ui/src/', '')}
            </Link>
          </span>
        ))}
        ; the packaged Markdown carries the same tables.
      </Text>
      {Object.entries(reference.props ?? {}).map(([name, entry]) => (
        <ExportProps key={name} name={name} entry={entry} />
      ))}
    </Stack>
  );
}
