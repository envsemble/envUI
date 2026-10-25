import { useTheme } from '@envsemble/envui';

/**
 * The catalogue's envUI Docs lockup, as supplied: the black artwork in a light theme, the white one
 * in a dark theme. It is decorative; the link around it names it.
 */
export function EnvUIDocsLogo({ className }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <img
      src={`${import.meta.env.BASE_URL}envUI-docs-lockup-${theme === 'dark' ? 'white' : 'black'}.svg`}
      alt=""
      className={className}
    />
  );
}
