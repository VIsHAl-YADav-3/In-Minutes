import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";
import toast from "react-hot-toast";

const NEXT_STATUS = {
  placed: "accepted",
  accepted: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_LABEL = {
  placed: "Accept Order",
  accepted: "Start Preparing",
  preparing: "Mark Out for Delivery",
  out_for_delivery: "Mark Delivered",
};

const SellerOrders = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    const res = await api.get("/restaurants/mine");
    setRestaurant(res.data.restaurant);
    if (res.data.restaurant) {
      const oRes = await api.get(`/orders/restaurant/${res.data.restaurant._id}`);
      setOrders(oRes.data.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order._id);
    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status: next });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data.order : o)));
      toast.success(`Order marked as ${next.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <TextLineSkeleton className="w-full" />
        <TextLineSkeleton className="w-full" />
      </div>
    );
  }

  if (!restaurant || orders.length === 0) {
    return <EmptyState icon={ClipboardList} title="No Orders Found" description="New orders from customers will appear here." />;
  }

  return (
    <div className="space-y-3 pb-10">
      {orders.map((order) => (
        <div key={order._id} className="card space-y-2.5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{order.customer?.name}</p>
              <p className="text-xs text-ink-900/50">{order.customer?.phone}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium capitalize">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="divide-y divide-ink-900/5 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-ink-900/5 pt-2 text-sm">
            <span className="font-semibold">Total: ₹{order.totalAmount}</span>
            <span className="text-xs uppercase text-ink-900/50">{order.paymentMethod} · {order.paymentStatus}</span>
          </div>

          {NEXT_STATUS[order.status] && (
            <button
              onClick={() => advance(order)}
              disabled={updating === order._id}
              className="btn-primary w-full text-sm"
            >
              {updating === order._id ? "Updating..." : NEXT_LABEL[order.status]}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SellerOrders;
