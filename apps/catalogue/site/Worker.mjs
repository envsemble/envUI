// The hosted catalogue's Worker script. The asset server answers every request for a file in
// dist/site, and every page load, which gets index.html when no file matches. This script receives
// only the remaining requests: those of scripts, styles or fetch() for a path with no file.
export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch(request: Request): Promise<Response> } }} env
   */
  async fetch(request, env) {
    // A missing bundle, such as one a page from another deployment asks for, is not found. The
    // index.html that would otherwise stand in for it would stay cached under the bundle's name.
    if (new URL(request.url).pathname.startsWith('/assets/'))
      return new Response('Not found\n', {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    // Any other path answers as a page load does, with index.html.
    return env.ASSETS.fetch(request);
  },
};
