import { Button, IconButton, Kbd, Row, Tooltip, useModifierKey } from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { preloadSearch } from './SiteSearch';

export function SearchButton({
  iconOnly = false,
  onClick,
  className,
}: {
  iconOnly?: boolean;
  onClick: () => void;
  className?: string;
}) {
  const modifier = useModifierKey();
  const keys = [modifier.label, 'K'];
  const ariaKeyShortcuts = `${modifier.key}+K`;
  if (iconOnly)
    return (
      <Tooltip
        side="bottom"
        content={
          <Row render={<span />} align="center" gap={2}>
            Search <Kbd keys={keys} />
          </Row>
        }
      >
        <IconButton
          variant="ghost"
          icon={<IconSearch />}
          aria-label="Search"
          aria-keyshortcuts={ariaKeyShortcuts}
          onClick={onClick}
          onPointerEnter={preloadSearch}
          onFocus={preloadSearch}
          className={className}
        />
      </Tooltip>
    );
  return (
    <Button
      variant="secondary"
      start={<IconSearch />}
      end={
        <>
          <Kbd
            keys={['Ctrl', 'K']}
            aria-hidden
            className="site-search-keys"
            data-site-keys="control"
          />
          <Kbd keys={['⌘', 'K']} aria-hidden className="site-search-keys" data-site-keys="meta" />
        </>
      }
      aria-keyshortcuts={ariaKeyShortcuts}
      onClick={onClick}
      onPointerEnter={preloadSearch}
      onFocus={preloadSearch}
      className={className}
    >
      Search
    </Button>
  );
}
