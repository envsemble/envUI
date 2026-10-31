import { Graphic } from '@envsemble/envui';

/** Stands in for the import of an illustration file, such as `import empty from './empty.svg'`. */
const illustration =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96">' +
      '<rect x="8" y="16" width="144" height="72" rx="10" fill="#ccfbf1"/>' +
      '<rect x="24" y="32" width="56" height="8" rx="4" fill="#0d9488"/>' +
      '<rect x="24" y="48" width="96" height="8" rx="4" fill="#5eead4"/>' +
      '<rect x="24" y="64" width="72" height="8" rx="4" fill="#5eead4"/>' +
      '<circle cx="132" cy="20" r="14" fill="#f97316"/></svg>',
  );

export default function FillBox() {
  return (
    // A box of the layout's own, such as an empty state's picture area: fill takes all of it.
    <div style={{ inlineSize: '16rem', blockSize: '8rem' }}>
      <Graphic src={illustration} alt="" size="fill" />
    </div>
  );
}
