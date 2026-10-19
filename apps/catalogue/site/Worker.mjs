// The hosted catalogue's Worker script. The asset server answers page loads, which get index.html
// when no file matches, and every request for a file outside /assets/. This script runs first for
// /assets/ (`run_worker_first` in wrangler.jsonc), and also receives the remaining requests: those
// of scripts, styles or fetch() for another path with no file.
export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch(request: Request): Promise<Response> } }} env
   */
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/assets/')) {
      // Any other path answers as a page load does, with index.html.
      return env.ASSETS.fetch(request);
    }
    // Vite names these files by a hash of their content, so a file never changes under its name.
    // _headers rules may not reach a response this script returns, so it sets their caching here.
    const response = await env.ASSETS.fetch(request);
    const html = response.headers.get('Content-Type')?.startsWith('text/html');
    if (response.status === 304 || (response.ok && !html)) {
      const asset = new Response(response.body, response);
      asset.headers.set('Cache-Control', 'private, max-age=31536000, immutable');
      asset.headers.set('X-Content-Type-Options', 'nosniff');
      return asset;
    }
    // A missing file, such as a bundle a page from another deployment asks for, is not found, also
    // when a browser opens it as a page: the index.html the asset server would put in its place
    // would stay cached under the file's name.
    return new Response('Not found\n', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
