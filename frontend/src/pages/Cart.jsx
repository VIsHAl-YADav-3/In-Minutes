import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Cart = () => {
  const { cart, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const deliveryFee = cart.items.length ? 30 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your Cart Is Empty"
        description="Looks like you haven't added anything yet. Browse restaurants to get started."
        action={
          <Link to="/" className="btn-primary">
            Browse Restaurants
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="font-display text-xl font-bold">Your Cart</h1>
      <p className="text-sm text-ink-900/50">Ordering from <span className="font-semibold text-ink-900">{cart.restaurantName}</span></p>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.foodId} className="card flex items-center gap-3 p-3">
            <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="text-sm text-ink-900/60">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-2 py-1.5">
              <button onClick={() => updateQuantity(item.foodId, -1)} className="rounded-lg bg-white p-1 shadow active:scale-95">
                <Minus className="h-3.5 w-3.5 text-brand-600" />
              </button>
              <span className="w-4 text-center text-sm font-semibold text-brand-700">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.foodId, 1)} className="rounded-lg bg-white p-1 shadow active:scale-95">
                <Plus className="h-3.5 w-3.5 text-brand-600" />
              </button>
            </div>
            <button onClick={() => removeItem(item.foodId)} className="p-1.5 text-ink-900/30 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-2 p-4 text-sm">
        <div className="flex justify-between text-ink-900/70">
          <span>Item Total</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-ink-900/70">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="flex justify-between text-ink-900/70">
          <span>Taxes & Charges</span>
          <span>₹{taxes}</span>
        </div>
        <div className="flex justify-between border-t border-ink-900/10 pt-2 text-base font-bold text-ink-900">
          <span>To Pay</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;
