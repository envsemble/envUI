import { LoadingState, Skeleton } from '@envsemble/envui';

export default function MemberRows() {
  return (
    <LoadingState label="Loading members">
      {[0, 1, 2].map((row) => (
        // An avatar and two lines of text per row, as the list will show them.
        <div
          key={row}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBlock: '0.5rem' }}
        >
          <Skeleton width="2rem" height="2rem" style={{ borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
            <Skeleton width={`${40 - row * 6}%`} height="0.875rem" emphasis="default" />
            <Skeleton width="24%" height="0.75rem" />
          </div>
        </div>
      ))}
    </LoadingState>
  );
}
