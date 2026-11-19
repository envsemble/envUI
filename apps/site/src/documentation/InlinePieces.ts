export type InlinePiece =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: InlinePiece[] };

const linkable = (href: string) => /^https?:\/\//i.test(href) || /^\/(?!\/)/.test(href);

export function inlinePieces(text: string): InlinePiece[] {
  const pieces: InlinePiece[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) pieces.push({ kind: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) {
      const children = inlinePieces(match[1]);
      if (linkable(match[2])) pieces.push({ kind: 'link', href: match[2], children });
      else pieces.push(...children);
    } else pieces.push({ kind: 'code', text: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) pieces.push({ kind: 'text', text: text.slice(last) });
  return pieces;
}
