import { Avatar, getInitials, LoadingBar, useLinkComponent, useSidebarCompact } from '@envsemble/envui';
import type { LoadingBarProps, MenuDensity, SurfaceDensity, ToastProps } from '@envsemble/envui';

export function Header(
  props: LoadingBarProps & { notification?: ToastProps; menu?: MenuDensity; bar?: SurfaceDensity },
) {
  const Link = useLinkComponent();
  const compact = useSidebarCompact();
  return (
    <header>
      <LoadingBar {...props} />
      <Avatar name="Alex Morgan" />
      <Link href="/">{compact ? getInitials('Alex Morgan') : 'Alex Morgan'}</Link>
    </header>
  );
}
