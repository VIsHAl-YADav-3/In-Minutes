import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Bell, User, Menu, X, Store, LogOut, ClipboardList, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import SearchSuggestions from "./SearchSuggestions.jsx";

const Navbar = ({ onOpenChat }) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { notifications } = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const unread = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 font-display text-xl font-extrabold text-brand-500">
          <span className="rounded-lg bg-brand-500 px-2 py-1 text-sm text-white">IM</span>
          <span className="hidden sm:inline">In Minutes</span>
        </Link>

        <div className="hidden flex-1 max-w-md md:block">
          <SearchSuggestions value={query} onChange={setQuery} placeholder="Search restaurants or food..." />
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link to="/" className="btn-ghost text-sm">Home</Link>
          <Link to="/search" className="btn-ghost text-sm">Restaurants</Link>
          {user && (
            <Link to="/orders" className="btn-ghost text-sm">Orders</Link>
          )}
          <button onClick={onOpenChat} className="btn-ghost text-sm">Help</button>

          {user && (
            <Link to="/notifications" className="btn-ghost relative px-2.5">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

          <Link to="/cart" className="btn-ghost relative px-2.5">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
              >
                {user.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-ink-900/10 bg-white py-1.5 shadow-premium animate-fadeUp">
                    <div className="px-4 py-2 text-sm">
                      <p className="truncate font-semibold text-ink-900">{user.name}</p>
                      <p className="truncate text-xs text-ink-900/50">{user.email}</p>
                    </div>
                    <div className="my-1 border-t border-ink-900/5" />
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                      <ClipboardList className="h-4 w-4" /> My Orders
                    </Link>
                    {user.role === "seller" ? (
                      <Link to="/seller" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                        <Store className="h-4 w-4" /> Seller Dashboard
                      </Link>
                    ) : user.role === "customer" ? (
                      <Link to="/become-a-seller" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
                        <Store className="h-4 w-4" /> Become a Seller
                      </Link>
                    ) : null}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50">
                        <Store className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { setMenuOpen(false); onOpenChat(); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-50">
                      <HelpCircle className="h-4 w-4" /> Help & Support
                    </button>
                    <div className="my-1 border-t border-ink-900/5" />
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1 px-4 py-2 text-sm">Login</Link>
          )}
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Link to="/cart" className="btn-ghost relative px-2">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen((v) => !v)} className="btn-ghost px-2">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchSuggestions value={query} onChange={setQuery} placeholder="Search restaurants or food..." />
      </div>

      {menuOpen && (
        <div className="border-t border-ink-900/5 bg-white px-4 py-2 md:hidden animate-fadeUp">
          {user ? (
            <div className="flex flex-col divide-y divide-ink-900/5">
              <div className="py-2 text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-ink-900/50">{user.email}</p>
              </div>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm">Profile</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm">My Orders</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm">Notifications {unread > 0 && `(${unread})`}</Link>
              {user.role === "seller" ? (
                <Link to="/seller" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-medium text-brand-600">Seller Dashboard</Link>
              ) : user.role === "customer" ? (
                <Link to="/become-a-seller" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-medium text-brand-600">Become a Seller</Link>
              ) : null}
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-medium text-brand-600">Admin Dashboard</Link>
              )}
              <button onClick={() => { setMenuOpen(false); onOpenChat(); }} className="py-2.5 text-left text-sm">Help & Support</button>
              <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} className="py-2.5 text-left text-sm text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2 py-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-sm">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-sm">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
