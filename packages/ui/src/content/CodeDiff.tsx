'use client';

import { parseDiffFromFile, preloadHighlighter, registerCustomTheme } from '@pierre/diffs';
import { File, FileDiff } from '@pierre/diffs/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button } from '../actions/Button.js';
import {
  codeThemeName,
  codeThemeStyle,
  diffTintOpacity,
  type CodeContrast,
} from './internal/codeColors.js';
import type { DiffTintColors } from './internal/codeThemes.js';
import { useCodeContrast } from './internal/useCodeContrast.js';
import { Column } from '../layout/Layout.js';
import { Text } from '../foundations/Text.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { IconError } from '../icons/Error.js';
import { useTheme } from '../foundations/Theme.js';
import { Spinner } from '../feedback/Spinner.js';
import { IconRefresh } from '../icons/Refresh.js';
import { codeDiff as codeDiffMessages } from '../foundations/messages/codeDiff.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { remPixels } from '../internal/dom/lengths.js';
import { useContainerSize } from '../foundations/useContainerSize.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import '../styles/Base.css';
import '../styles/Code.css';

/** A note attached to a line of a CodeDiff, such as a review comment. */
export interface CodeDiffAnnotation {
  /**
   * The line's side: deletions for a line of before, additions for a line of after. A file that
   * didn't change has one side.
   * @default 'additions'
   */
  side?: 'deletions' | 'additions';
  /** The line's number on its side, from 1; 0 places the note above the first change. */
  lineNumber: number;
  /** The application's own data for renderAnnotation, such as the comment's id. */
  data?: unknown;
}

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
  /**
   * auto (default) sets old and new side by side from 56 rem of width; split always sets them side
   * by side, such as for a split and unified toggle; unified keeps one column.
   */
  layout?: 'auto' | 'split' | 'unified';
  /**
   * Content at the end of the file header, such as View file, Accept or Revert, or a status Badge.
   */
  headerEnd?: ReactNode;
  /** Notes attached to lines, such as review comments, which renderAnnotation draws under them. */
  annotations?: readonly CodeDiffAnnotation[];
  /** Draws one of annotations under its line. */
  renderAnnotation?: (annotation: CodeDiffAnnotation) => ReactNode;
  /**
   * The level of the heading of what shows when the diff fails to load, for the page's outline.
   * @default 3
   */
  headingLevel?: HeadingLevel;
}

const wrappedLineHangingIndentCh = 4;
const diffsOwnLinePaddingCh = 1;

function diffsCssOverTheCodeBlockLayer({
  addition,
  deletion,
  additionGutter,
  deletionGutter,
}: DiffTintColors) {
  const percent = (opacity: number) => `${Math.round(opacity * 100)}%`;
  const word = (color: string) =>
    `color-mix(in srgb, ${color} ${percent(diffTintOpacity.word)}, transparent)`;
  const kept = percent(1 - diffTintOpacity.line);
  return `:host {
  --diffs-light-bg: transparent;
  --diffs-dark-bg: transparent;
  --diffs-bg-addition-override: ${addition};
  --diffs-bg-addition-number-override: ${additionGutter};
  --diffs-bg-addition-emphasis-override: ${word(addition)};
  --diffs-bg-deletion-override: ${deletion};
  --diffs-bg-deletion-number-override: ${deletionGutter};
  --diffs-bg-deletion-emphasis-override: ${word(deletion)};
}
[data-line], [data-no-newline], [data-gutter-buffer], [data-column-number] {
  --mix-light: ${kept};
  --mix-dark: ${kept};
}
[data-overflow=wrap] [data-line] {
  padding-inline-start: ${diffsOwnLinePaddingCh + wrappedLineHangingIndentCh}ch;
  text-indent: -${wrappedLineHangingIndentCh}ch;
}`;
}

const splitFromOwnWidthRem = 56;

const diffThemeNames = (contrast: CodeContrast) => ({
  light: codeThemeName('light', contrast),
  dark: codeThemeName('dark', contrast),
});
const loadCodeThemesWithHighlighter = () => import('./internal/codeThemes.js');

let themesRegistered = false;
function registerCodeThemesWithDiffsOnce() {
  if (themesRegistered) return;
  themesRegistered = true;
  for (const contrast of ['standard', 'high'] as const)
    for (const scheme of ['light', 'dark'] as const)
      registerCustomTheme(codeThemeName(scheme, contrast), async () =>
        (await loadCodeThemesWithHighlighter()).codeTheme(scheme, contrast),
      );
}

let highlighterReady: Promise<void> | undefined;
const loadedLanguages = new Set<string>();
const loadedContrasts = new Set<CodeContrast>();

function prepareHighlighter(language: string, contrast: CodeContrast) {
  if (loadedLanguages.has(language) && loadedContrasts.has(contrast) && highlighterReady)
    return highlighterReady;
  registerCodeThemesWithDiffsOnce();
  const contrasts = new Set([...loadedContrasts, contrast]);
  highlighterReady = preloadHighlighter({
    langs: [...loadedLanguages, language],
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
  headerEnd,
  annotations,
  renderAnnotation,
  headingLevel = 3,
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
  const [keptUntilNextLoads, setKeptUntilNextLoads] = useState<{
    lang: string;
    theme: typeof theme;
    contrast: CodeContrast;
    css: string;
  } | null>(null);
  const loaded = keptUntilNextLoads?.lang === lang;
  const wide = useWideEnoughToSplitBeforePaint(rootRef, layout === 'auto' && loaded);

  useEffect(() => {
    let active = true;
    Promise.all([
      prepareHighlighter(lang, contrast),
      loadCodeThemesWithHighlighter().then(({ diffTintColors }) => diffTintColors(theme, contrast)),
    ]).then(
      ([, colors]) => {
        if (active)
          setKeptUntilNextLoads({
            lang,
            theme,
            contrast,
            css: diffsCssOverTheCodeBlockLayer(colors),
          });
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [lang, theme, contrast, attempt]);

  const fileDiff = useMemo(() => {
    const diff = parseDiffFromFile(
      { name: filename, contents: before, lang: lang },
      { name: filename, contents: after, lang: lang },
    );
    const cacheKeyThatChangesWithContents = JSON.stringify([filename, lang, before, after]);
    diff.cacheKey = cacheKeyThatChangesWithContents;
    return diff;
  }, [filename, lang, before, after]);

  const diffAnnotations = useMemo(
    () =>
      annotations?.map((annotation) => ({
        side: annotation.side ?? ('additions' as const),
        lineNumber: annotation.lineNumber,
        metadata: annotation,
      })),
    [annotations],
  );
  const fileAnnotations = useMemo(
    () =>
      annotations?.map((annotation) => ({
        lineNumber: annotation.lineNumber,
        metadata: annotation,
      })),
    [annotations],
  );
  const drawAnnotation = useMemo(
    () =>
      renderAnnotation &&
      (({ metadata }: { metadata: CodeDiffAnnotation }) => renderAnnotation(metadata)),
    [renderAnnotation],
  );
  const drawHeaderEnd = useMemo(
    () => (headerEnd != null ? () => headerEnd : undefined),
    [headerEnd],
  );
  const FailedHeading = `h${headingLevel}` as const;
  const previousThemeStillShown =
    keptUntilNextLoads && keptUntilNextLoads.theme !== theme ? keptUntilNextLoads.theme : undefined;
  return (
    <div
      {...props}
      ref={rootRef}
      className={classNames('env-code-diff', className)}
      style={
        previousThemeStillShown ? { ...codeThemeStyle(previousThemeStillShown), ...style } : style
      }
      aria-busy={!loaded && !failed ? true : undefined}
    >
      {failed ? (
        <Column role="alert" gap={4} className="env-code-diff-failed">
          <span className="env-code-diff-failed-icon">
            <DecorativeIcon>
              <IconError />
            </DecorativeIcon>
          </span>
          <Column gap={2}>
            <Text render={<FailedHeading />} variant="title">
              {messages.failed}
            </Text>
            <Text variant="body-sm">{messages.failedDescription}</Text>
          </Column>
          <Button
            variant="secondary"
            start={<IconRefresh />}
            onClick={() => {
              setFailed(false);
              setAttempt((current) => current + 1);
            }}
          >
            {messages.retry}
          </Button>
        </Column>
      ) : !loaded || !keptUntilNextLoads ? (
        <Spinner label={messages.loading} showLabel />
      ) : before === after ? (
        <File
          file={{ name: filename, contents: after, lang: lang }}
          disableWorkerPool
          lineAnnotations={fileAnnotations}
          renderAnnotation={drawAnnotation}
          renderHeaderMetadata={drawHeaderEnd}
          options={{
            overflow: 'wrap',
            theme: diffThemeNames(keptUntilNextLoads.contrast),
            themeType: keptUntilNextLoads.theme,
            disableFileHeader: !header,
            unsafeCSS: keptUntilNextLoads.css,
          }}
        />
      ) : (
        <FileDiff
          fileDiff={fileDiff}
          disableWorkerPool
          lineAnnotations={diffAnnotations}
          renderAnnotation={drawAnnotation}
          renderHeaderMetadata={drawHeaderEnd}
          options={{
            diffStyle: layout === 'split' || wide ? 'split' : 'unified',
            overflow: 'wrap',
            theme: diffThemeNames(keptUntilNextLoads.contrast),
            themeType: keptUntilNextLoads.theme,
            disableFileHeader: !header,
            expandUnchanged,
            unsafeCSS: keptUntilNextLoads.css,
          }}
        />
      )}
    </div>
  );
}

function useWideEnoughToSplitBeforePaint(
  rootRef: RefObject<HTMLDivElement | null>,
  measure: boolean,
) {
  const size = useContainerSize(measure ? rootRef : null);
  const root = rootRef.current;
  return (
    measure &&
    size !== undefined &&
    root !== null &&
    size.inlineSize >= splitFromOwnWidthRem * remPixels(root)
  );
}

function languageOf(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension && extension !== filename.toLowerCase() ? extension : 'text';
}
