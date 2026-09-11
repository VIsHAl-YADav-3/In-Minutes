import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Store, UtensilsCrossed, Tag } from "lucide-react";
import api from "../api/client.js";

/**
 * A search input with a live "type-ahead" dropdown showing matching
 * restaurants, food items, and categories — debounced to avoid hammering
 * the API on every keystroke.
 */
const SearchSuggestions = ({ value, onChange, placeholder, autoFocus, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = value.trim();
    if (q.length < 2) {
      setRestaurants([]);
      setFoods([]);
      setCategories([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [rRes, fRes] = await Promise.all([
          api.get("/restaurants", { params: { q, limit: 4 } }),
          api.get("/food/search", { params: { q, limit: 4 } }),
        ]);
        setRestaurants(rRes.data.restaurants);
        setFoods(fRes.data.foods.slice(0, 4));

        // Derive matching categories from both result sets for a "Pizza Category" style suggestion
        const cats = new Set();
        [...rRes.data.restaurants, ...fRes.data.foods].forEach((item) => {
          if (item.category && item.category.toLowerCase().includes(q.toLowerCase())) {
            cats.add(item.category);
          }
        });
        setCategories([...cats].slice(0, 3));
      } catch {
        // Fail silently for suggestions — not critical path
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  const goToSearch = (q) => {
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const hasResults = restaurants.length > 0 || foods.length > 0 || categories.length > 0;
  const showDropdown = open && value.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-900/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) goToSearch(value.trim());
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input pl-9"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-ink-900/10 bg-white py-1.5 shadow-premium animate-fadeUp">
          {loading && (
            <p className="px-4 py-2.5 text-xs text-ink-900/40">Searching...</p>
          )}

          {!loading && !hasResults && (
            <p className="px-4 py-2.5 text-xs text-ink-900/40">No matches yet — press Enter to search "{value}"</p>
          )}

          {categories.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-900/35">Categories</p>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => goToSearch(c)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <Tag className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                  <span>{c} <span className="text-ink-900/40">category</span></span>
                </button>
              ))}
            </div>
          )}

          {restaurants.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-900/35">Restaurants</p>
              {restaurants.map((r) => (
                <button
                  key={r._id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/restaurants/${r._id}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <img src={r.coverImage} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="truncate text-xs text-ink-900/40">{r.location}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {foods.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-900/35">Food Items</p>
              {foods.map((f) => (
                <button
                  key={f._id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/restaurants/${f.restaurant?._id}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <img src={f.image} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="truncate text-xs text-ink-900/40">₹{f.price} · {f.restaurant?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {hasResults && (
            <button
              onClick={() => goToSearch(value.trim())}
              className="mt-1 flex w-full items-center gap-2 border-t border-ink-900/5 px-4 py-2.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              <Search className="h-3.5 w-3.5" /> See all results for "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
