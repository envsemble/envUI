'use client';

import { parseDiffFromFile, preloadHighlighter, registerCustomTheme } from '@pierre/diffs';
import { File, FileDiff } from '@pierre/diffs/react';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from 'react';
import { Button } from '../actions/Button.js';
import {
  codeThemeName,
  codeThemeStyle,
  type CodeContrast,
} from '../content/internal/CodeColors.js';
import { diffTheme } from '../content/internal/CodeThemes.js';
import { useCodeContrast } from '../content/internal/useCodeContrast.js';
import { Column } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Error as ErrorIcon } from '../icons/Error.js';
import { useTheme } from '../foundations/Theme.js';
import { Spinner } from '../feedback/Spinner.js';
import { Refresh } from '../icons/Refresh.js';
import { codeDiff as codeDiffMessages } from '../foundations/messages/codeDiff.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';

export interface CodeDiffProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The source before the change. */
  before: string;
  /** The source after the change. */
  after: string;
  /** Names the file in the header and chooses its language, such as form.json. */
  filename: string;
  /** Overrides the language the file name implies, such as json. */
  language?: string;
  /** Shows the file header with its name and change counts; true by default. */
  header?: boolean;
  /** Shows the unchanged lines between changes instead of folding them; false by default. */
  expandUnchanged?: boolean;
  /** auto (default) sets old and new side by side from 56 rem of width; unified keeps one column. */
  layout?: 'auto' | 'unified';
}

/**
 * Diffs paints its own background from the theme's editor color; it takes the diff background
 * instead, as the style sheet chooses it for the contrast.
 */
const DIFF_BACKGROUND_CSS = `:host { --diffs-light-bg: var(--env-code-background-now, var(--env-code-diff-background)); --diffs-dark-bg: var(--env-code-background-now, var(--env-code-diff-background)); }`;

/** Side by side from this many rem of the diff's own width. */
const SPLIT_FROM_REM = 56;

/** The names of the readable code themes of code diffs for a contrast, light and dark. */
const diffThemeNames = (contrast: CodeContrast) => ({
  light: codeThemeName('diff', 'light', contrast),
  dark: codeThemeName('diff', 'dark', contrast),
});
let themesRegistered = false;
/** Registers the diff themes with Diffs once, under their names; each is built when Diffs asks. */
function registerThemes() {
  if (themesRegistered) return;
  themesRegistered = true;
  for (const contrast of ['standard', 'high'] as const)
    for (const scheme of ['light', 'dark'] as const)
      registerCustomTheme(
        codeThemeName('diff', scheme, contrast),
        async () => diffTheme(scheme, contrast) as never,
      );
}

let highlighterReady: Promise<void> | undefined;
const loadedLanguages = new Set<string>();
const loadedContrasts = new Set<CodeContrast>();

/**
 * Loads a language and the themes of a contrast into Diffs' highlighter, adding to what it has:
 * the high-contrast themes load only once a diff shows at high contrast.
 */
function prepareHighlighter(language: string, contrast: CodeContrast) {
  if (loadedLanguages.has(language) && loadedContrasts.has(contrast) && highlighterReady)
    return highlighterReady;
  // The code themes, readable on changed lines too; the app theme chooses between them.
  registerThemes();
  const contrasts = new Set([...loadedContrasts, contrast]);
  highlighterReady = preloadHighlighter({
    langs: [...loadedLanguages, language] as never,
    themes: [...contrasts].flatMap((each) => Object.values(diffThemeNames(each))),
  }).then(
    () => {
      loadedLanguages.add(language);
      loadedContrasts.add(contrast);
    },
    (error: unknown) => {
      highlighterReady = undefined;
      throw error;
    },
  );
  return highlighterReady;
}

/**
 * The changes between two versions of a file, rendered by Diffs (diffs.com) in the code theme
 * of the app theme, as code blocks are; the whole file when nothing changed.
 */
export function CodeDiff({
  before,
  after,
  filename,
  language,
  header = true,
  expandUnchanged = false,
  layout = 'auto',
  className,
  style,
  ...props
}: CodeDiffProps) {
  const { theme } = useTheme();
  const messages = useMessages('codeDiff', codeDiffMessages);
  const lang = language ?? languageOf(filename);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const contrast = useCodeContrast(rootRef);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    prepareHighlighter(lang, contrast).then(
      () => {
        if (active) setLoaded(true);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [lang, contrast, attempt]);

  // Split and unified are different markup from Diffs, which CSS can't switch between, so the
  // width is measured: as the diff loads, before it paints, so it never shows the other layout
  // first, and again as the root resizes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || layout !== 'auto' || !loaded) {
      setWide(false);
      return;
    }
    const rem =
      Number.parseFloat(getComputedStyle(root.ownerDocument.documentElement).fontSize) || 16;
    const style = getComputedStyle(root);
    setWide(
      root.clientWidth -
        (Number.parseFloat(style.paddingLeft) || 0) -
        (Number.parseFloat(style.paddingRight) || 0) >=
        SPLIT_FROM_REM * rem,
    );
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWide(entry.contentRect.width >= SPLIT_FROM_REM * rem);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [layout, loaded]);

  const fileDiff = useMemo(() => {
    const diff = parseDiffFromFile(
      { name: filename, contents: before, lang: lang as never },
      { name: filename, contents: after, lang: lang as never },
    );
    // Diffs otherwise keys its render cache by the file names alone, which stay the same while the
    // contents change, as in a live draft.
    diff.cacheKey = JSON.stringify([filename, lang, before, after]);
    return diff;
  }, [filename, lang, before, after]);

  return (
    // On the code theme's own background, as a code block is: Diffs leaves its background clear.
    <div
      {...props}
      ref={rootRef}
      className={classNames('env-code-diff', className)}
      style={{ ...codeThemeStyle(theme), ...style }}
      aria-busy={!loaded && !failed ? true : undefined}
    >
      {failed ? (
        // An alert, so the failure is announced: the error icon, a heading, a sentence and Retry.
        <Column role="alert" gap={4} className="env-code-diff-failed">
          <span className="env-code-diff-failed-icon">
            <DecorativeIcon>
              <ErrorIcon />
            </DecorativeIcon>
          </span>
          <Column gap={2}>
            <Text render={<h3 />} variant="title">
              {messages.failed}
            </Text>
            <Text variant="body-sm">{messages.failedDescription}</Text>
          </Column>
          <Button
            variant="secondary"
            startIcon={<Refresh />}
            onClick={() => {
              setFailed(false);
              setAttempt((current) => current + 1);
            }}
          >
            {messages.retry}
          </Button>
        </Column>
      ) : !loaded ? (
        <Spinner label={messages.loading} showLabel />
      ) : before === after ? (
        <File
          file={{ name: filename, contents: after, lang: lang as never }}
          disableWorkerPool
          options={{
            overflow: 'wrap',
            theme: diffThemeNames(contrast),
            themeType: theme,
            disableFileHeader: !header,
            unsafeCSS: DIFF_BACKGROUND_CSS,
          }}
        />
      ) : (
        <FileDiff
          fileDiff={fileDiff}
          disableWorkerPool
          options={{
            diffStyle: wide ? 'split' : 'unified',
            overflow: 'wrap',
            theme: diffThemeNames(contrast),
            themeType: theme,
            disableFileHeader: !header,
            expandUnchanged,
            unsafeCSS: DIFF_BACKGROUND_CSS,
          }}
        />
      )}
    </div>
  );
}

function languageOf(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension && extension !== filename.toLowerCase() ? extension : 'text';
}
