import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Phone, UtensilsCrossed, ArrowLeft } from "lucide-react";
import api from "../api/client.js";
import FoodCard from "../components/FoodCard.jsx";
import { FoodRowSkeleton, TextLineSkeleton } from "../components/Skeletons.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { cart, addItem, updateQuantity } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/restaurants/${id}`), api.get(`/reviews/restaurant/${id}`)])
      .then(([rRes, revRes]) => {
        setRestaurant(rRes.data.restaurant);
        setFoods(rRes.data.foods);
        setReviews(revRes.data.reviews);
      })
      .catch(() => toast.error("Couldn't load this restaurant."))
      .finally(() => setLoading(false));
  }, [id]);

  const categories = ["All", ...new Set(foods.map((f) => f.category))];
  const visibleFoods = activeCategory === "All" ? foods : foods.filter((f) => f.category === activeCategory);

  const getQty = (foodId) => cart.items.find((i) => i.foodId === foodId)?.quantity || 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-44 w-full" />
        <TextLineSkeleton className="w-1/2" />
        <TextLineSkeleton className="w-1/3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <FoodRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!restaurant) {
    return <EmptyState icon={UtensilsCrossed} title="Restaurant not found" description="It may have been removed." />;
  }

  return (
    <div className="space-y-5 pb-24">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-900/60 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="relative h-44 w-full overflow-hidden rounded-xl2 bg-neutral-100 sm:h-64">
        <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <img
          src={restaurant.profileImage}
          alt=""
          className="absolute bottom-3 left-4 h-14 w-14 rounded-xl border-2 border-white object-cover shadow-lg"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-ink-900">{restaurant.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${restaurant.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {restaurant.isOpen ? "Currently Open" : "Currently Closed"}
          </span>
          {restaurant.approvalStatus !== "approved" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Pending Approval (preview)
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-ink-900/60">{restaurant.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-900/70">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
            {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"} ({restaurant.numReviews} reviews)
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {restaurant.location}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-4 w-4" /> {restaurant.contact}
          </span>
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-4 w-4" /> {foods.length} Items Available
          </span>
        </div>
      </div>

      {!restaurant.isOpen && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          This restaurant is currently closed. You can browse the menu, but ordering is disabled until they reopen.
        </div>
      )}

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium ${
                activeCategory === c ? "border-brand-500 bg-brand-500 text-white" : "border-ink-900/10 bg-white text-ink-900/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Menu */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink-900">Menu</h2>
        {foods.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No Food Items Available" description="This restaurant hasn't added any items yet." />
        ) : (
          <div className="grid gap-3">
            {visibleFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurant={restaurant}
                quantity={getQty(food._id)}
                onAdd={() => {
                  if (!user) return toast.error("Please login to add items to your cart");
                  addItem(food, restaurant);
                }}
                onIncrease={() => updateQuantity(food._id, 1)}
                onDecrease={() => updateQuantity(food._id, -1)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink-900">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-900/50">No reviews yet. Be the first to review after your order!</p>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 6).map((rev) => (
              <div key={rev._id} className="card p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{rev.user?.name || "Anonymous"}</p>
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" /> {rev.rating}
                  </span>
                </div>
                {rev.comment && <p className="mt-1 text-sm text-ink-900/60">{rev.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {cart.items.length > 0 && cart.restaurantId === restaurant._id && (
        <Link
          to="/cart"
          className="fixed bottom-20 left-1/2 z-30 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-xl bg-brand-500 px-5 py-3.5 text-white shadow-premium md:bottom-6"
        >
          <span className="text-sm font-semibold">{cart.items.reduce((s, i) => s + i.quantity, 0)} items in cart</span>
          <span className="text-sm font-bold">View Cart →</span>
        </Link>
      )}
    </div>
  );
};

export default RestaurantDetails;
