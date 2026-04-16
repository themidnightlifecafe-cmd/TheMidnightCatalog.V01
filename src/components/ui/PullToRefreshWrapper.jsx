import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import usePullToRefresh from '@/hooks/usePullToRefresh';

export default function PullToRefreshWrapper({ onRefresh, children, className }) {
  const { containerRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(onRefresh);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto scrollbar-hide", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: refreshing ? 48 : pullDistance > 0 ? pullDistance : 0 }}
      >
        <RefreshCw
          className={cn("w-5 h-5 text-primary transition-transform", refreshing && "animate-spin")}
          style={{ transform: !refreshing ? `rotate(${pullDistance * 3}deg)` : undefined }}
        />
      </div>
      {children}
    </div>
  );
}