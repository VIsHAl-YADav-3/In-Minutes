import { NavLink, Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, Store, Users, ClipboardList, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/restaurants", label: "Restaurants", icon: Store },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
];

const AdminLayout = () => {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand-500" />
        <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-ink-900/10 pb-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-500 text-white" : "text-ink-900/60 hover:bg-neutral-100"
              }`
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
