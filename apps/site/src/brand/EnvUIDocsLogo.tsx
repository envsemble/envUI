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
