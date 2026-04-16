import { useRef, useState, useCallback } from 'react';

const THRESHOLD = 70; // px to pull before triggering

export default function usePullToRefresh(onRefresh) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const el = containerRef.current;
    if (el && el.scrollTop > 0) { startY.current = null; return; }
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) { startY.current = null; return; }
    // resist beyond threshold
    const dist = Math.min(dy * 0.5, THRESHOLD * 1.5);
    setPulling(true);
    setPullDistance(dist);
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling) return;
    if (pullDistance >= THRESHOLD * 0.5) {
      setRefreshing(true);
      setPullDistance(0);
      setPulling(false);
      try { await onRefresh(); } finally { setRefreshing(false); }
    } else {
      setPulling(false);
      setPullDistance(0);
    }
    startY.current = null;
  }, [pulling, pullDistance, onRefresh]);

  return { containerRef, pulling, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}