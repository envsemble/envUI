import { Avatar, getInitials, LoadingBar, Skeleton, useLinkComponent, useSidebarCompact } from '@envsemble/envui';
import type { LoadingBarProps, MenuDensity, SkeletonProps, SurfaceDensity, ToastProps } from '@envsemble/envui';

export function Header(
  props: LoadingBarProps & { notification?: ToastProps; menu?: MenuDensity; bar?: SurfaceDensity; placeholder?: SkeletonProps },
) {
  const Link = useLinkComponent();
  const compact = useSidebarCompact();
  return (
    <header>
      <LoadingBar {...props} />
      <Avatar name="Alex Morgan" />
      <Skeleton />
      <Link href="/">{compact ? getInitials('Alex Morgan') : 'Alex Morgan'}</Link>
    </header>
  );
}
