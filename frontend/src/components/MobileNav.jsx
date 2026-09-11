import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

const tabs = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/orders", icon: ClipboardList, label: "Orders" },
  { to: "/profile", icon: User, label: "Profile" },
];

const MobileNav = () => {
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-ink-900/5 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
              isActive ? "text-brand-500" : "text-ink-900/45"
            }`
          }
        >
          <div className="relative">
            <Icon className="h-5 w-5" />
            {to === "/cart" && totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-500 text-[8px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
