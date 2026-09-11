import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ClipboardList, Star, Power } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import toast from "react-hot-toast";

const SellerDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [foodCount, setFoodCount] = useState(0);
  const [maxFoodItems, setMaxFoodItems] = useState(50);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/restaurants/mine");
      setRestaurant(res.data.restaurant);
      setFoodCount(res.data.foodCount || 0);
      setMaxFoodItems(res.data.maxFoodItems || 50);
      if (res.data.restaurant) {
        const oRes = await api.get(`/orders/restaurant/${res.data.restaurant._id}`);
        setOrders(oRes.data.orders);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      const res = await api.patch(`/restaurants/${restaurant._id}/status`);
      setRestaurant(res.data.restaurant);
      toast.success(res.data.restaurant.isOpen ? "Restaurant is now Open" : "Restaurant is now Closed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <TextLineSkeleton className="w-1/2" />
        <TextLineSkeleton className="w-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No restaurant yet"
        description="Complete your seller onboarding to create your restaurant."
        action={
          <Link to="/become-a-seller" className="btn-primary">
            Start Onboarding
          </Link>
        }
      />
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-4 p-4">
        <img src={restaurant.coverImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display font-semibold">{restaurant.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                restaurant.approvalStatus === "approved"
                  ? "bg-green-100 text-green-700"
                  : restaurant.approvalStatus === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {restaurant.approvalStatus === "approved" ? "Live" : restaurant.approvalStatus === "pending" ? "Pending Approval" : "Rejected"}
            </span>
          </div>
          <p className="text-xs text-ink-900/50">{restaurant.location}</p>
        </div>
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold ${
            restaurant.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          <Power className="h-3.5 w-3.5" /> {restaurant.isOpen ? "Open" : "Closed"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5 text-center">
          <p className="font-display text-xl font-bold text-brand-600">{orders.length}</p>
          <p className="text-xs text-ink-900/50">Total Orders</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="font-display text-xl font-bold text-brand-600">{foodCount}/{maxFoodItems}</p>
          <p className="text-xs text-ink-900/50">Food Items</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="font-display text-xl font-bold text-brand-600">{restaurant.rating?.toFixed(1) || "—"}</p>
          <p className="text-xs text-ink-900/50">Rating</p>
        </div>
      </div>

      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-ink-900/70">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Orders Found" description="Orders will appear here as customers order from you." />
        ) : (
          recentOrders.map((o) => (
            <div key={o._id} className="card flex items-center justify-between p-3.5">
              <div>
                <p className="text-sm font-semibold">{o.customer?.name}</p>
                <p className="text-xs text-ink-900/50">{o.items.length} items · ₹{o.totalAmount}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium capitalize">
                {o.status.replace(/_/g, " ")}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default SellerDashboard;
