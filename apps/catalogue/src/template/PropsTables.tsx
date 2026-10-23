import { Link, Column, Text } from '@envsemble/envui';
import { PlainCode, SimpleTable } from './SimpleTable';
import type { ExportEntry, PropEntry } from '../DocumentationTypes';
import type { Reference } from '../Reference';
// The ids search leads to, as the search index writes them.
import { exportSection, propSection } from '../../../../scripts/SearchAnchors.mjs';

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
    <Column render={<section />} gap={4} aria-labelledby={exportSection(name)}>
      <Text render={<h2 />} variant="title" id={exportSection(name)}>
        <PlainCode>{name}</PlainCode>
      </Text>
      {entry.description && <Text>{entry.description}</Text>}
      {entry.kind === 'function' ? (
        <Text>
          <PlainCode>{`${name}${entry.signature}`}</PlainCode>
        </Text>
      ) : entry.props.length ? (
        <SimpleTable
          label={`${name} props`}
          columns={[
            { title: 'Prop', width: '17%' },
            { title: 'Type', width: '25%' },
            { title: 'Default', width: '14%' },
            { title: 'Description', width: '44%' },
          ]}
          rows={entry.props.map((prop) => ({
            key: prop.name,
            // Search leads to a prop's row: props-Button-variant.
            id: propSection(name, prop.name),
            cells: [
              <>
                <PlainCode>{prop.name}</PlainCode>
                {prop.required && <span className="docs-prop-required"> required</span>}
              </>,
              <PlainCode key="type">{prop.type}</PlainCode>,
              prop.default !== undefined ? (
                <PlainCode key="default">{prop.default}</PlainCode>
              ) : prop.defaultBuiltIn ? (
                'built-in'
              ) : (
                '—'
              ),
              description(prop),
            ],
          }))}
        />
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
export function PropsTables({ reference }: { reference: Reference }) {
  const sources = [...new Set(Object.values(reference.props ?? {}).map(({ source }) => source))];
  return (
    <Column gap={7}>
      <Text emphasis="muted">
        Generated from the TypeScript source,{' '}
        {sources.map((source, index) => (
          <span key={source}>
            {index > 0 && ', '}
            <Link
              href={`https://github.com/envsemble/envUI/blob/${__ENVUI_SOURCE_REVISION__}/${source}`}
            >
              {source.replace('packages/ui/src/', '')}
            </Link>
          </span>
        ))}
        ; the packaged Markdown carries the same tables.
      </Text>
      {Object.entries(reference.props ?? {}).map(([name, entry]) => (
        <ExportProps key={name} name={name} entry={entry} />
      ))}
    </Column>
  );
}
