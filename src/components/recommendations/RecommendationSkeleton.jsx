export default function RecommendationSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border bg-card animate-pulse">
      <div className="w-16 h-24 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-2.5 bg-muted rounded w-1/3" />
        <div className="h-3.5 bg-muted rounded w-4/5" />
        <div className="h-2.5 bg-muted rounded w-1/2" />
        <div className="h-2 bg-muted rounded w-full mt-2" />
        <div className="h-2 bg-muted rounded w-3/4" />
        <div className="h-6 bg-muted rounded w-24 mt-2" />
      </div>
    </div>
  );
}