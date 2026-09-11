import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, CreditCard, Wallet, Check } from "lucide-react";
import api, { getErrorMessage } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loadRazorpayScript } from "../utils/loadRazorpay.js";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses?.find((a) => a.isDefault)?._id || user?.addresses?.[0]?._id || ""
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", fullAddress: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
  }, [cart.items.length, navigate]);

  const deliveryFee = 30;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const saveAddress = async () => {
    if (!newAddress.fullAddress.trim()) return toast.error("Please enter your address");
    try {
      const res = await api.post("/auth/me/addresses", newAddress);
      setAddresses(res.data.addresses);
      setSelectedAddressId(res.data.addresses[res.data.addresses.length - 1]._id);
      setShowAddForm(false);
      setNewAddress({ label: "Home", fullAddress: "", city: "", pincode: "" });
      await refreshUser();
      toast.success("Address saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const buildDeliveryAddressPayload = () => ({
    label: selectedAddress.label,
    fullAddress: selectedAddress.fullAddress,
    city: selectedAddress.city,
    state: selectedAddress.state,
    pincode: selectedAddress.pincode,
    landmark: selectedAddress.landmark,
  });

  const placeCodOrder = async () => {
    setPlacing(true);
    try {
      const res = await api.post("/orders/cod", {
        items: cart.items,
        restaurantId: cart.restaurantId,
        deliveryAddress: buildDeliveryAddressPayload(),
      });
      clearCart();
      toast.success("Order placed! Pay on delivery.");
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  const placeRazorpayOrder = async () => {
    setPlacing(true);
    try {
      const orderRes = await api.post("/payments/razorpay/order", {
        items: cart.items,
        restaurantId: cart.restaurantId,
        deliveryAddress: buildDeliveryAddressPayload(),
      });
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Couldn't load payment gateway. Check your connection.");
        setPlacing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "In Minutes",
        description: `Order from ${cart.restaurantName}`,
        order_id: razorpayOrderId,
        theme: { color: "#fd5812" },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payments/razorpay/verify", response);
            clearCart();
            toast.success("Payment successful! Order confirmed.");
            navigate(`/orders/${verifyRes.data.order._id}`);
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await api.post("/payments/razorpay/failure", { razorpay_order_id: razorpayOrderId, reason: "Payment cancelled by user" }).catch(() => {});
            setPlacing(false);
          },
        },
      });

      rzp.on("payment.failed", async () => {
        await api.post("/payments/razorpay/failure", { razorpay_order_id: razorpayOrderId, reason: "Payment failed" }).catch(() => {});
        toast.error("Payment failed. Please try again or use Cash on Delivery.");
        setPlacing(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return toast.error("Please select or add a delivery address");
    if (paymentMethod === "cod") placeCodOrder();
    else placeRazorpayOrder();
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <h1 className="font-display text-xl font-bold">Checkout</h1>

      {/* Address */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-900/70">Delivery Address</h2>
        {addresses.length === 0 && !showAddForm && (
          <p className="text-sm text-ink-900/50">No saved addresses yet.</p>
        )}
        <div className="space-y-2">
          {addresses.map((addr) => (
            <button
              key={addr._id}
              onClick={() => setSelectedAddressId(addr._id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
                selectedAddressId === addr._id ? "border-brand-500 bg-brand-50" : "border-ink-900/10 bg-white"
              }`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{addr.label}</p>
                <p className="truncate text-xs text-ink-900/60">{addr.fullAddress}</p>
              </div>
              {selectedAddressId === addr._id && <Check className="h-4 w-4 shrink-0 text-brand-500" />}
            </button>
          ))}
        </div>

        {showAddForm ? (
          <div className="card space-y-2.5 p-3.5">
            <input
              className="input"
              placeholder="Label (Home, Work...)"
              value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
            />
            <textarea
              className="input"
              placeholder="Full address"
              rows={2}
              value={newAddress.fullAddress}
              onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                className="input"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <input
                className="input"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveAddress} className="btn-primary flex-1 text-sm">Save Address</button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="btn-secondary w-full text-sm">
            <Plus className="h-4 w-4" /> Add New Address
          </button>
        )}
      </section>

      {/* Order review */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-900/70">Order Summary</h2>
        <div className="card divide-y divide-ink-900/5 p-3.5">
          {cart.items.map((item) => (
            <div key={item.foodId} className="flex justify-between py-1.5 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="card space-y-1.5 p-3.5 text-sm">
          <div className="flex justify-between text-ink-900/60"><span>Item Total</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between text-ink-900/60"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
          <div className="flex justify-between text-ink-900/60"><span>Taxes & Charges</span><span>₹{taxes}</span></div>
          <div className="flex justify-between border-t border-ink-900/10 pt-1.5 text-base font-bold"><span>Total</span><span>₹{total}</span></div>
        </div>
      </section>

      {/* Payment method */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink-900/70">Payment Method</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setPaymentMethod("razorpay")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 ${
              paymentMethod === "razorpay" ? "border-brand-500 bg-brand-50" : "border-ink-900/10 bg-white"
            }`}
          >
            <CreditCard className="h-5 w-5 text-brand-500" />
            <span className="text-xs font-semibold">Pay Online</span>
            <span className="text-[10px] text-ink-900/50">via Razorpay</span>
          </button>
          <button
            onClick={() => setPaymentMethod("cod")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 ${
              paymentMethod === "cod" ? "border-brand-500 bg-brand-50" : "border-ink-900/10 bg-white"
            }`}
          >
            <Wallet className="h-5 w-5 text-brand-500" />
            <span className="text-xs font-semibold">Cash on Delivery</span>
            <span className="text-[10px] text-ink-900/50">Pay at your door</span>
          </button>
        </div>
      </section>

      <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full py-3">
        {placing ? "Processing..." : paymentMethod === "cod" ? `Place Order · ₹${total}` : `Pay ₹${total}`}
      </button>
    </div>
  );
};

export default Checkout;
