import { useEffect, useState } from "react";
import { Users, Store, UtensilsCrossed, ClipboardList, IndianRupee, CreditCard, Wallet } from "lucide-react";
import api from "../../api/client.js";
import { TextLineSkeleton } from "../../components/Skeletons.jsx";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card flex items-center gap-3 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
      <Icon className="h-5 w-5 text-brand-500" />
    </div>
    <div>
      <p className="font-display text-xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-900/50">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.stats));
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <TextLineSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
      <StatCard icon={Store} label="Total Sellers" value={stats.totalSellers} />
      <StatCard icon={Store} label="Total Restaurants" value={stats.totalRestaurants} />
      <StatCard icon={UtensilsCrossed} label="Total Food Items" value={stats.totalFoodItems} />
      <StatCard icon={ClipboardList} label="Total Orders" value={stats.totalOrders} />
      <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.totalRevenue}`} />
      <StatCard icon={CreditCard} label="Online Payments" value={stats.onlinePayments} />
      <StatCard icon={Wallet} label="COD Orders" value={stats.codOrders} />
    </div>
  );
};

export default AdminDashboard;
