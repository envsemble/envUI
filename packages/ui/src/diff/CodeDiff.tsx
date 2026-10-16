'use client';

import { parseDiffFromFile, preloadHighlighter, registerCustomTheme } from '@pierre/diffs';
import { File, FileDiff } from '@pierre/diffs/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type RefObject,
} from 'react';
import { Button } from '../actions/Button.js';
import {
  codeBackground,
  codeThemeStyle,
  diffTheme,
  type CodeContrast,
} from '../content/internal/CodeThemes.js';
import { EmptyState } from '../feedback/EmptyState.js';
import { useTheme } from '../foundations/Theme.js';
import { LoadingState } from '../feedback/LoadingState.js';
import { Skeleton } from '../feedback/Skeleton.js';
import { Refresh } from '../icons/Refresh.js';
import { classNames } from '../internal/classNames.js';

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
 * Diffs paints its own background from the theme's editor color; it takes the code blocks'
 * background instead, so diffs and snippets match in both app themes.
 */
const DIFF_BACKGROUND_CSS = `:host { --diffs-light-bg: ${codeBackground('light')}; --diffs-dark-bg: ${codeBackground('dark')}; }`;

/** Side by side from this many rem of the diff's own width. */
const SPLIT_FROM_REM = 56;

/** The names of the readable Pierre themes of code diffs for a contrast, light and dark. */
const diffThemeNames = (contrast: CodeContrast) => ({
  light: diffTheme('light', contrast).name!,
  dark: diffTheme('dark', contrast).name!,
});
let themesRegistered = false;
/** Registers the diff themes with Diffs once, under their names; each is built when Diffs asks. */
function registerThemes() {
  if (themesRegistered) return;
  themesRegistered = true;
  for (const contrast of ['standard', 'high'] as const)
    for (const scheme of ['light', 'dark'] as const)
      registerCustomTheme(
        `envui-pierre-diff-${scheme}${contrast === 'high' ? '-high' : ''}`,
        async () => diffTheme(scheme, contrast) as never,
      );
}

/**
 * The contrast of the nearest Theme around an element, as the style sheet reads it: high where it
 * says so, standard where it says so, and otherwise high while the system asks for more contrast.
 * Diffs takes its colors as themes rather than from the style sheet, so it follows this.
 */
function useCodeContrast(ref: RefObject<HTMLElement | null>): CodeContrast {
  const { contrast: themeContrast } = useTheme();
  const [contrast, setContrast] = useState<CodeContrast>(
    themeContrast === 'high' ? 'high' : 'standard',
  );
  useEffect(() => {
    const element = ref.current;
    const theme = element?.closest('.env-theme');
    const media = window.matchMedia?.('(prefers-contrast: more)');
    const update = () => {
      const attribute = theme?.getAttribute('data-env-contrast');
      setContrast(
        attribute === 'high' || (attribute !== 'standard' && media?.matches) ? 'high' : 'standard',
      );
    };
    update();
    media?.addEventListener('change', update);
    const observer = new MutationObserver(update);
    if (theme)
      observer.observe(theme, { attributes: true, attributeFilter: ['data-env-contrast'] });
    return () => {
      media?.removeEventListener('change', update);
      observer.disconnect();
    };
  }, [ref, themeContrast]);
  return contrast;
}

let highlighterReady: Promise<void> | undefined;
const loadedLanguages = new Set<string>();

function prepareHighlighter(language: string) {
  if (loadedLanguages.has(language) && highlighterReady) return highlighterReady;
  // The Pierre themes, readable on changed lines too; the app theme chooses between them.
  registerThemes();
  highlighterReady = preloadHighlighter({
    langs: [...loadedLanguages, language] as never,
    themes: [
      ...Object.values(diffThemeNames('standard')),
      ...Object.values(diffThemeNames('high')),
    ],
  }).then(
    () => {
      loadedLanguages.add(language);
    },
    (error: unknown) => {
      highlighterReady = undefined;
      throw error;
    },
  );
  return highlighterReady;
}

/**
 * The changes between two versions of a file, rendered by Diffs (diffs.com) in its own Pierre theme
 * for the app theme, as code blocks are; the whole file when nothing changed.
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
    prepareHighlighter(lang).then(
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
  }, [lang, attempt]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || layout !== 'auto' || !loaded) {
      setWide(false);
      return;
    }
    const rem =
      Number.parseFloat(getComputedStyle(root.ownerDocument.documentElement).fontSize) || 16;
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
        <EmptyState
          tone="error"
          headingLevel={3}
          title="Changes could not be shown"
          description="The code highlighter did not load."
          action={
            <Button
              variant="secondary"
              startIcon={<Refresh />}
              onClick={() => {
                setFailed(false);
                setAttempt((current) => current + 1);
              }}
            >
              Retry
            </Button>
          }
        />
      ) : !loaded ? (
        <LoadingState label="Loading changes">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton width="95%" height="1rem" />
        </LoadingState>
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
