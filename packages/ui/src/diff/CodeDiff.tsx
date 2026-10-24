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
  diffTintOpacity,
  type CodeContrast,
} from '../content/internal/CodeColors.js';
import { codeTheme, diffTintColors, type DiffTintColors } from '../content/internal/CodeThemes.js';
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
 * Diffs paints its own background from the theme's editor color, and mixes its line tints, gutter
 * and separators from it. It takes a transparent one instead, so that the diff sits on the code
 * block's layer, which its root paints over whatever surface it is on, and each line's and word's
 * tint is its color at an opacity over that layer: the colors that keep the code theme's tokens
 * readable there.
 */
function diffCSS({ addition, deletion }: DiffTintColors) {
  const percent = (opacity: number) => `${Math.round(opacity * 100)}%`;
  const word = (color: string) =>
    `color-mix(in srgb, ${color} ${percent(diffTintOpacity.word)}, transparent)`;
  const kept = percent(1 - diffTintOpacity.line);
  return `:host {
  --diffs-light-bg: transparent;
  --diffs-dark-bg: transparent;
  --diffs-bg-addition-override: ${addition};
  --diffs-bg-addition-number-override: ${addition};
  --diffs-bg-addition-emphasis-override: ${word(addition)};
  --diffs-bg-deletion-override: ${deletion};
  --diffs-bg-deletion-number-override: ${deletion};
  --diffs-bg-deletion-emphasis-override: ${word(deletion)};
}
[data-line], [data-no-newline], [data-gutter-buffer], [data-column-number] {
  --mix-light: ${kept};
  --mix-dark: ${kept};
}`;
}

/** Side by side from this many rem of the diff's own width. */
const SPLIT_FROM_REM = 56;

/** The names of the code themes for a contrast, light and dark, the ones code blocks take. */
const diffThemeNames = (contrast: CodeContrast) => ({
  light: codeThemeName('light', contrast),
  dark: codeThemeName('dark', contrast),
});
let themesRegistered = false;
/** Registers the code themes with Diffs once, under their names; each is built when Diffs asks. */
function registerThemes() {
  if (themesRegistered) return;
  themesRegistered = true;
  for (const contrast of ['standard', 'high'] as const)
    for (const scheme of ['light', 'dark'] as const)
      registerCustomTheme(
        codeThemeName(scheme, contrast),
        async () => codeTheme(scheme, contrast) as never,
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
  // The code themes of code blocks; the app theme chooses between them.
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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const contrast = useCodeContrast(rootRef);
  // The highlighter with the language and the code themes, and the tints of the app theme.
  const [tints, setTints] = useState<{ key: string; css: string } | null>(null);
  const tintsKey = `${lang}-${theme}-${contrast}`;
  const loaded = tints?.key === tintsKey;
  const [wide, setWide] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([prepareHighlighter(lang, contrast), diffTintColors(theme, contrast)]).then(
      ([, colors]) => {
        if (active) setTints({ key: tintsKey, css: diffCSS(colors) });
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [lang, theme, contrast, tintsKey, attempt]);

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
    // On the code block's layer, which the style sheet paints: Diffs leaves its background clear.
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
            unsafeCSS: tints?.css,
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
            unsafeCSS: tints?.css,
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
