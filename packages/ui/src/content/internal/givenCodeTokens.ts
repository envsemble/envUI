import type { CodeToken } from './codeHighlighting.js';

/*
 * Tokens of code highlighted ahead, such as by a page pre-rendered with its code highlighted, which
 * gives the browser the same tokens before it hydrates: a code block whose tokens were given
 * renders highlighted from its first render, on the server and in the browser alike, without
 * loading the highlighter. Standard contrast only, which a page renders until it knows the
 * reader's.
 */

/** A code block's source and its language, as the highlighter names it, such as tsx. */
export interface CodeSource {
  source: string;
  language: string;
}

const key = ({ source, language }: CodeSource) => `${language}\0${source}`;
const given = new Map<string, CodeToken[][]>();
let rendering: Map<string, CodeSource> | undefined;

/** Gives the tokens of a source, which a code block of it renders from then on. */
export function giveCodeTokens(code: CodeSource, tokens: CodeToken[][]) {
  given.set(key(code), tokens);
}

/**
 * The tokens given for a source, if any. Notes the source while the sources code blocks render
 * are collected (collectRenderedCode).
 */
export function givenCodeTokens(code: CodeSource): CodeToken[][] | undefined {
  rendering?.set(key(code), code);
  return given.get(key(code));
}

/**
 * Collects the sources code blocks render until the returned function is called, which returns
 * them: a pre-render highlights those without tokens and renders the page again, and gives the
 * browser the tokens of them all.
 */
export function collectRenderedCode(): () => CodeSource[] {
  const collected = new Map<string, CodeSource>();
  rendering = collected;
  return () => {
    if (rendering === collected) rendering = undefined;
    return [...collected.values()];
  };
}
