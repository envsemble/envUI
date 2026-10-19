/**
 * Frame addresses: ?frame=<page>/<Name>&scale=<comfortable|compact>&theme=<light|dark>[&dir=rtl].
 * They live apart from TemplateFrame.tsx so that module exports only its component and stays a
 * React Fast Refresh boundary: a non-component export there made every edit of the envUI package
 * reload the whole catalogue, since main.tsx imports it and accepts no hot updates.
 */
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
