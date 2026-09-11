import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, UtensilsCrossed } from "lucide-react";
import api from "../api/client.js";
import RestaurantCard from "../components/RestaurantCard.jsx";
import { RestaurantGridSkeleton } from "../components/Skeletons.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SearchSuggestions from "../components/SearchSuggestions.jsx";
import { Link } from "react-router-dom";

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("");

  const runSearch = (q) => {
    setLoading(true);
    Promise.all([
      api.get("/restaurants", { params: { q, sort } }),
      api.get("/food/search", { params: { q } }),
    ])
      .then(([rRes, fRes]) => {
        setRestaurants(rRes.data.restaurants);
        setFoods(fRes.data.foods);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ, sort]);

  useEffect(() => {
    // Keep the URL in sync as the user types a fresh query from this page
    const handle = setTimeout(() => {
      if (query !== initialQ) setParams(query ? { q: query } : {});
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="space-y-6">
      <SearchSuggestions
        value={query}
        onChange={setQuery}
        placeholder="Search restaurants, food, or categories..."
        autoFocus
      />

      <div className="flex flex-wrap gap-2">
        {["", "rating", "popular"].map((s) => (
          <button
            key={s || "relevance"}
            onClick={() => setSort(s)}
            className={`rounded-full border px-3.5 py-1 text-xs font-medium ${
              sort === s ? "border-brand-500 bg-brand-500 text-white" : "border-ink-900/10 bg-white text-ink-900/70"
            }`}
          >
            {s === "" ? "Relevance" : s === "rating" ? "Top Rated" : "Popular"}
          </button>
        ))}
      </div>

      {loading ? (
        <RestaurantGridSkeleton count={6} />
      ) : (
        <>
          {foods.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-sm font-semibold text-ink-900/70">Food Items</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {foods.slice(0, 12).map((f) => (
                  <Link
                    key={f._id}
                    to={`/restaurants/${f.restaurant?._id}`}
                    className="card flex w-40 shrink-0 flex-col overflow-hidden"
                  >
                    <img src={f.image} alt={f.name} className="h-24 w-full object-cover" loading="lazy" />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold">{f.name}</p>
                      <p className="text-xs text-ink-900/50">₹{f.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 font-display text-sm font-semibold text-ink-900/70">Restaurants</h2>
            {restaurants.length === 0 && foods.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="No Results Found"
                description={initialQ ? `Nothing matched "${initialQ}". Try a different search.` : "Search for restaurants or food to get started."}
              />
            ) : restaurants.length === 0 ? (
              <EmptyState icon={UtensilsCrossed} title="No matching restaurants" description="Try browsing food items above instead." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                {restaurants.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default SearchResults;
