import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";
import toast from "react-hot-toast";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/restaurants", { params: filter ? { status: filter } : {} })
      .then((res) => setRestaurants(res.data.restaurants))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setApproval = async (id, status) => {
    try {
      await api.patch(`/admin/restaurants/${id}/approval`, { status });
      toast.success(`Restaurant ${status}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteRestaurant = async (id) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success("Restaurant deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1 text-xs font-medium capitalize ${
              filter === f ? "border-brand-500 bg-brand-500 text-white" : "border-ink-900/10 bg-white text-ink-900/70"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <TextLineSkeleton className="w-full" />
      ) : restaurants.length === 0 ? (
        <EmptyState icon={Store} title="No Restaurants Found" description="There are currently no restaurants available. Please check back later." />
      ) : (
        <div className="space-y-2.5">
          {restaurants.map((r) => (
            <div key={r._id} className="card flex items-center gap-3 p-3.5">
              <img src={r.coverImage} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-ink-900/50">{r.owner?.name} · {r.owner?.email}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    r.approvalStatus === "approved" ? "bg-green-100 text-green-700" : r.approvalStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {r.approvalStatus}
                </span>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                {r.approvalStatus !== "approved" && (
                  <button onClick={() => setApproval(r._id, "approved")} className="rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white">
                    Approve
                  </button>
                )}
                {r.approvalStatus !== "rejected" && (
                  <button onClick={() => setApproval(r._id, "rejected")} className="rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-600">
                    Reject
                  </button>
                )}
                <button onClick={() => deleteRestaurant(r._id)} className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-ink-900/60">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;
