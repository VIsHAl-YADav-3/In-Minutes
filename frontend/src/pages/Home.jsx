import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store, ChefHat } from "lucide-react";
import api from "../api/client.js";
import RestaurantCard from "../components/RestaurantCard.jsx";
import { RestaurantGridSkeleton } from "../components/Skeletons.jsx";
import EmptyState from "../components/EmptyState.jsx";

const CATEGORIES = ["All", "North Indian", "South Indian", "Chinese", "Italian", "Fast Food", "Cafe", "Desserts", "Healthy"];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/restaurants", { params: category !== "All" ? { category } : {} })
      .then((res) => setRestaurants(res.data.restaurants))
      .catch(() => setError("Couldn't load restaurants. Please try again."))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-10 text-white sm:px-10 sm:py-14 animate-fadeUp">
        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Food from your favorite places, delivered in minutes.
          </h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">
            Discover restaurants near you, order in a few taps, and track it live.
          </p>
          <Link to="/search" className="btn-secondary mt-6 inline-flex bg-white text-brand-600 hover:bg-white/90">
            Explore Restaurants
          </Link>
        </div>
        <ChefHat className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 text-white/10" strokeWidth={1} />
      </section>

      {/* Category chips */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink-900/10 bg-white text-ink-900/70 hover:bg-neutral-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurant grid */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
          {category === "All" ? "Restaurants near you" : category}
        </h2>

        {loading ? (
          <RestaurantGridSkeleton count={8} />
        ) : error ? (
          <EmptyState icon={Store} title="Something went wrong" description={error} />
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Restaurants Found"
            description="There are currently no restaurants available. Please check back later."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
