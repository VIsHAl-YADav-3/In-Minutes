import { Link } from "react-router-dom";
import { Star, MapPin, UtensilsCrossed } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className="card group block overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-premium"
    >
      <div className="relative h-36 w-full overflow-hidden bg-neutral-100">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!restaurant.isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-900">
              Currently Closed
            </span>
          </div>
        )}
        {restaurant.rating > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-ink-900 shadow">
            <Star className="h-3 w-3 fill-brand-500 text-brand-500" />
            {restaurant.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="truncate font-display text-sm font-semibold text-ink-900">{restaurant.name}</h3>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-900/50">
          <MapPin className="h-3 w-3 shrink-0" />
          {restaurant.location}
        </p>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-900/60">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3 w-3" />
            {restaurant.foodCount || 0} items
          </span>
          <span className={restaurant.isOpen ? "font-medium text-green-600" : "font-medium text-red-500"}>
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
