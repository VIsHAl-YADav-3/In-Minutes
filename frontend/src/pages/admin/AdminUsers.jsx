import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/users", { params: role ? { role } : {} })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const toggleActive = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.user : u)));
      toast.success(res.data.user.isActive ? "User activated" : "User deactivated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["", "customer", "seller", "admin"].map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRole(r)}
            className={`rounded-full border px-3.5 py-1 text-xs font-medium capitalize ${
              role === r ? "border-brand-500 bg-brand-500 text-white" : "border-ink-900/10 bg-white text-ink-900/70"
            }`}
          >
            {r || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <TextLineSkeleton className="w-full" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="card flex items-center justify-between p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="truncate text-xs text-ink-900/50">{u.email} · <span className="capitalize">{u.role}</span></p>
              </div>
              <button
                onClick={() => toggleActive(u)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {u.isActive ? "Active" : "Deactivated"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
