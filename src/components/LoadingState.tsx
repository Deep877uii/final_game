export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="surface rounded-xl p-4 flex items-center gap-4"
        >
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3 rounded-lg" />
            <div className="skeleton h-3 w-1/2 rounded-lg" />
          </div>
          <div className="skeleton h-3 w-20 hidden sm:block rounded-lg" />
          <div className="skeleton h-3 w-24 hidden md:block rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="surface rounded-xl p-6 space-y-3"
        >
          <div className="skeleton h-4 w-20 rounded-lg" />
          <div className="skeleton h-8 w-16 rounded-lg" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return <CardSkeleton count={4} />;
}
