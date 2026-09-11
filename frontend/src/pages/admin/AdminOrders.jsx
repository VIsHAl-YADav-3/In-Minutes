import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import api from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/orders").then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <TextLineSkeleton className="w-full" />;

  if (orders.length === 0) {
    return <EmptyState icon={ClipboardList} title="No Orders Found" />;
  }

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o._id} className="card flex items-center justify-between p-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{o.restaurant?.name} — {o.customer?.name}</p>
            <p className="text-xs text-ink-900/50">
              ₹{o.totalAmount} · {o.paymentMethod.toUpperCase()} · {new Date(o.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium capitalize">
            {o.status.replace(/_/g, " ")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
