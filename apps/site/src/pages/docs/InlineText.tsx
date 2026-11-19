import { Fragment, type ReactNode } from 'react';
import { Code, Link } from '@envsemble/envui';
import { inlinePieces, type InlinePiece } from '../../documentation/InlinePieces';

export function Pieces({ pieces }: { pieces: InlinePiece[] }): ReactNode {
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {piece.kind === 'text' && piece.text}
      {piece.kind === 'code' && <Code>{piece.text}</Code>}
      {piece.kind === 'link' && (
        <Link href={piece.href}>
          <Pieces pieces={piece.children} />
        </Link>
      )}
    </Fragment>
  ));
}

export const InlineText = ({ text }: { text: string }) => <Pieces pieces={inlinePieces(text)} />;

export function DescriptionText({ text }: { text: string }) {
  const [lead = '', ...items] = text.split(/ - (?=`)/);
  if (!items.length) return <InlineText text={text} />;
  return (
    <>
      <InlineText text={lead} />
      <ul className="docs-prop-description-list">
        {items.map((item, index) => (
          <li key={index}>
            <InlineText text={item} />
          </li>
        ))}
      </ul>
    </>
  );
}
