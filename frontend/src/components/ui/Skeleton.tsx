export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-cinema-card hairline">
      <Skeleton className="aspect-[2/3] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
