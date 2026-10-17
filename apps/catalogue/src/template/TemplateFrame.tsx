import {
  lazy,
  Suspense,
  useLayoutEffect,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  EnvUIProvider,
  LinkProvider,
  Text,
  Theme,
  Toast,
  type LinkComponentProps,
} from '@envsemble/envui';
import { documents } from '../Reference';
import { LoadBoundary, loadModule, reloadPage } from './LoadBoundary';

/**
 * The frame route: a template's screen alone, without the catalogue around it, at
 * ?frame=<page>/<Name>&scale=<comfortable|compact>&theme=<light|dark>[&dir=rtl] on any catalogue
 * address. The template page's previews show it in iframes, so the screen gets a viewport of its
 * own: the app frame switches layouts on viewport media queries, and its landmarks must not nest in
 * the catalogue's. The tests open it directly.
 */
const loaders = import.meta.glob<{
  default: ComponentType<{ children?: ReactNode; current?: string }>;
}>('../examples/*/*.tsx');
const examplePath = (page: string, name: string) => `../examples/${page}/${name}.tsx`;
/** The app frame template, which screens of `frame: app` render inside. */
const appFrame = { page: 'app-frame', name: 'AppFrame' };

export interface FrameRequest {
  page: string;
  name: string;
  scale: 'comfortable' | 'compact';
  theme: 'light' | 'dark';
  dir: 'ltr' | 'rtl';
}

/** The screen a frame address asks for, or undefined when it asks for none. */
export function frameRequest(search: string): FrameRequest | undefined {
  const params = new URLSearchParams(search);
  const frame = params.get('frame');
  if (!frame) return undefined;
  const [page = '', name = ''] = frame.split('/');
  return {
    page,
    name,
    scale: params.get('scale') === 'compact' ? 'compact' : 'comfortable',
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
    dir: params.get('dir') === 'rtl' ? 'rtl' : 'ltr',
  };
}

/** The address of a frame, from the catalogue's address: its path or file, with the frame's query. */
export function frameHref(
  request: Omit<FrameRequest, 'dir'> & { dir?: FrameRequest['dir'] },
  base = window.location.href,
) {
  const url = new URL(base);
  url.hash = '';
  url.search = new URLSearchParams({
    frame: `${request.page}/${request.name}`,
    scale: request.scale,
    theme: request.theme,
    ...(request.dir === 'rtl' && { dir: 'rtl' }),
  }).toString();
  return url.href;
}

/** The template block a frame shows, from the page's generated documentation. */
function blockOf(page: string, name: string) {
  const document = documents.find((entry) => entry.id === page);
  for (const section of document?.sections ?? [])
    for (const block of section.blocks)
      if (block.kind === 'template' && block.name === name) return { document, block };
  return undefined;
}

/** Links in a frame keep their semantics, but a path of the application goes nowhere. */
function FrameLink({ onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        const url = new URL(props.href, window.location.href);
        if (url.origin === window.location.origin) event.preventDefault();
      }}
    />
  );
}

/** Every screen as a lazy component, made once at load, as LiveExample makes its examples. */
const screens = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);
const screenOf = (page: string, name: string) => screens.get(examplePath(page, name));

function Missing({ what }: { what: string }) {
  return <Text role="alert">No template {what} in the catalogue.</Text>;
}

/** The frame route's page: the requested screen, in the requested theme, scale and direction. */
export function TemplateFrame({ request }: { request: FrameRequest }) {
  const { page, name, scale, theme, dir } = request;
  const found = blockOf(page, name);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('env-theme');
    root.setAttribute('data-env-theme', theme);
    root.setAttribute('data-env-scale', scale);
    root.setAttribute('data-env-contrast', 'standard');
    root.style.colorScheme = theme;
    root.dir = dir;
    // The screen's heading, and its page's title where that differs.
    if (found)
      document.title = [found.block.heading, found.document?.title]
        .filter((title, index, titles) => title && titles.indexOf(title) === index)
        .join(' · ');
  }, [theme, scale, dir, found]);
  const Screen = found ? screenOf(page, name) : undefined;
  // A screen of the app frame renders inside the app frame template, once there is one.
  const Frame = found?.block.frame === 'app' ? screenOf(appFrame.page, appFrame.name) : undefined;
  return (
    <Theme theme={theme} scale={scale} contrast="standard" data-template-frame={`${page}/${name}`}>
      <EnvUIProvider dir={dir}>
        <Toast.Provider>
          <LinkProvider component={FrameLink}>
            <LoadBoundary
              what="template"
              modules={[`src/examples/${page}/${name}.tsx`]}
              // The frame is a page of its own: a failed file loads again with the page.
              onRetry={() => void reloadPage([`src/examples/${page}/${name}.tsx`])}
            >
              <Suspense fallback={<Text role="status">Loading template…</Text>}>
                {!Screen ? (
                  <Missing what={`${page}/${name}`} />
                ) : Frame ? (
                  // The frame and the screen are looked up among module-level lazy components,
                  // not created here.
                  // eslint-disable-next-line react-hooks/static-components
                  <Frame current={page}>
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <Screen />
                  </Frame>
                ) : (
                  // eslint-disable-next-line react-hooks/static-components
                  <Screen />
                )}
              </Suspense>
            </LoadBoundary>
          </LinkProvider>
        </Toast.Provider>
      </EnvUIProvider>
    </Theme>
  );
}
