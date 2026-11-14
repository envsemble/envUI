/**
 * The catalogue's envUI Docs lockup, as supplied: the artwork for light backgrounds in a light
 * theme, the one for dark backgrounds in a dark theme. Both render and the page's theme shows one
 * (Shell.css), so a pre-rendered page shows the reader's from the first paint, where the root has
 * the theme before the site hydrates.
 * It is decorative; the link around it names it.
 */
export function EnvUIDocsLogo({ className }: { className?: string }) {
  return (['on-light', 'on-dark'] as const).map((artwork) => (
    <img
      key={artwork}
      src={`${import.meta.env.BASE_URL}envui-docs-horizontal-${artwork}.svg`}
      alt=""
      className={className}
      data-docs-lockup={artwork}
    />
  ));
}
