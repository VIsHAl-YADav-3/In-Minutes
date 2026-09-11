import { Plus, Minus, Star } from "lucide-react";

const FoodCard = ({ food, restaurant, quantity, onAdd, onIncrease, onDecrease }) => {
  const disabled = !food.isAvailable || !restaurant?.isOpen;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-900/5 bg-white p-3 transition-shadow hover:shadow-card">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        <img src={food.image} alt={food.name} loading="lazy" className="h-full w-full object-cover" />
        {!food.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="px-1 text-center text-[10px] font-semibold leading-tight text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-ink-900">{food.name}</h4>
        {food.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-900/50">{food.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-sm font-bold text-ink-900">₹{food.price}</span>
          {food.numReviews > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-ink-900/50">
              <Star className="h-3 w-3 fill-brand-500 text-brand-500" />
              {food.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {disabled ? (
          <button disabled className="btn-secondary cursor-not-allowed px-3 py-1.5 text-xs opacity-50">
            {!food.isAvailable ? "Out of Stock" : "Closed"}
          </button>
        ) : quantity > 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-2 py-1.5">
            <button onClick={onDecrease} className="rounded-lg bg-white p-1 shadow active:scale-95">
              <Minus className="h-3.5 w-3.5 text-brand-600" />
            </button>
            <span className="w-4 text-center text-sm font-semibold text-brand-700">{quantity}</span>
            <button onClick={onIncrease} className="rounded-lg bg-white p-1 shadow active:scale-95">
              <Plus className="h-3.5 w-3.5 text-brand-600" />
            </button>
          </div>
        ) : (
          <button onClick={onAdd} className="btn-primary px-3 py-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
