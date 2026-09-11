import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import { TextLineSkeleton } from "../components/Skeletons.jsx";

const statusColors = {
  placed: "bg-blue-100 text-blue-700",
  accepted: "bg-indigo-100 text-indigo-700",
  preparing: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabel = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const OrderRow = ({ order }) => (
  <Link to={`/orders/${order._id}`} className="card flex items-center gap-3 p-3.5">
    <img src={order.restaurant?.profileImage || order.restaurant?.coverImage} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{order.restaurant?.name}</p>
      <p className="text-xs text-ink-900/50">{order.items.length} items · ₹{order.totalAmount}</p>
      <p className="text-xs text-ink-900/40">{new Date(order.createdAt).toLocaleString()}</p>
    </div>
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
      {statusLabel(order.status)}
    </span>
  </Link>
);

const Orders = () => {
  const [data, setData] = useState({ current: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("current");

  useEffect(() => {
    api
      .get("/orders/mine")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const list = tab === "current" ? data.current : data.past;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-xl font-bold">My Orders</h1>

      <div className="flex gap-2">
        {["current", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              tab === t ? "border-brand-500 bg-brand-500 text-white" : "border-ink-900/10 bg-white text-ink-900/70"
            }`}
          >
            {t === "current" ? "Current" : "Past"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <TextLineSkeleton className="w-full" />
          <TextLineSkeleton className="w-full" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Orders Found"
          description={tab === "current" ? "You have no active orders right now." : "You haven't placed any orders yet."}
          action={
            <Link to="/" className="btn-primary">
              Browse Restaurants
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <OrderRow key={o._id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
