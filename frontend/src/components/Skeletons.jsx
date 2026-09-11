export const RestaurantCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-36 w-full rounded-none" />
    <div className="space-y-2 p-4">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  </div>
);

export const RestaurantGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <RestaurantCardSkeleton key={i} />
    ))}
  </div>
);

export const FoodRowSkeleton = () => (
  <div className="flex items-center gap-4 rounded-xl border border-ink-900/5 p-3">
    <div className="skeleton h-20 w-20 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-3 w-1/4" />
    </div>
  </div>
);

export const TextLineSkeleton = ({ className = "" }) => <div className={`skeleton h-4 ${className}`} />;
