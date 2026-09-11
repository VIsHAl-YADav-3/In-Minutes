import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Circle, MapPin, X, Star } from "lucide-react";
import api, { getErrorMessage } from "../api/client.js";
import { TextLineSkeleton } from "../components/Skeletons.jsx";
import toast from "react-hot-toast";

const STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "accepted", label: "Restaurant Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [foodRatings, setFoodRatings] = useState({}); // foodId -> rating chosen (pre-submit)
  const [submittedFoodIds, setSubmittedFoodIds] = useState(new Set());
  const [submittingFoodId, setSubmittingFoodId] = useState(null);

  const load = () => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => toast.error("Couldn't load this order"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cancelOrder = async () => {
    try {
      await api.patch(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        restaurantId: order.restaurant._id,
        orderId: order._id,
        rating,
        comment,
      });
      toast.success("Thanks for your review!");
      setComment("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitFoodReview = async (foodId) => {
    const foodRating = foodRatings[foodId] || 5;
    setSubmittingFoodId(foodId);
    try {
      await api.post("/reviews", {
        foodId,
        orderId: order._id,
        rating: foodRating,
      });
      setSubmittedFoodIds((prev) => new Set(prev).add(foodId));
      toast.success("Thanks for rating this dish!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingFoodId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <TextLineSkeleton className="w-1/2" />
        <TextLineSkeleton className="w-full" />
        <TextLineSkeleton className="w-full" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      <div>
        <h1 className="font-display text-xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
        <p className="text-sm text-ink-900/50">{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="card flex items-center gap-3 p-3.5">
        <img src={order.restaurant?.coverImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
        <div>
          <p className="font-semibold">{order.restaurant?.name}</p>
          <p className="text-xs text-ink-900/50">{order.restaurant?.contact}</p>
        </div>
      </div>

      {/* Tracking timeline */}
      {isCancelled ? (
        <div className="card flex items-center gap-3 p-4 text-red-600">
          <X className="h-5 w-5" /> This order was cancelled.
        </div>
      ) : (
        <div className="card p-5">
          {STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-brand-500 text-white" : "bg-ink-900/10 text-ink-900/30"}`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-8 w-0.5 ${i < currentStepIndex ? "bg-brand-500" : "bg-ink-900/10"}`} />}
                </div>
                <p className={`pb-6 text-sm ${done ? "font-semibold text-ink-900" : "text-ink-900/40"}`}>{step.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Address */}
      <div className="card p-3.5">
        <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><MapPin className="h-4 w-4" /> Delivery Address</p>
        <p className="text-sm text-ink-900/60">{order.deliveryAddress?.fullAddress}</p>
      </div>

      {/* Items */}
      <div className="card divide-y divide-ink-900/5 p-3.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-1.5 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span className="font-medium">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Payment */}
      <div className="card space-y-1.5 p-3.5 text-sm">
        <div className="flex justify-between text-ink-900/60"><span>Item Total</span><span>₹{order.itemsTotal}</span></div>
        <div className="flex justify-between text-ink-900/60"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>
        <div className="flex justify-between text-ink-900/60"><span>Taxes</span><span>₹{order.taxes}</span></div>
        <div className="flex justify-between border-t border-ink-900/10 pt-1.5 text-base font-bold"><span>Total</span><span>₹{order.totalAmount}</span></div>
        <div className="flex justify-between pt-1.5 text-xs text-ink-900/50">
          <span>Payment Method</span>
          <span className="font-medium uppercase">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-xs text-ink-900/50">
          <span>Payment Status</span>
          <span className="font-medium capitalize">{order.paymentStatus}</span>
        </div>
      </div>

      {["placed", "accepted"].includes(order.status) && (
        <button onClick={cancelOrder} className="btn-secondary w-full text-red-600">
          Cancel Order
        </button>
      )}

      {order.status === "delivered" && (
        <div className="card space-y-2.5 p-4">
          <p className="text-sm font-semibold">Rate your experience</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star className={`h-6 w-6 ${n <= rating ? "fill-brand-500 text-brand-500" : "text-ink-900/20"}`} />
              </button>
            ))}
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="Write a review (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={submitReview} disabled={submittingReview} className="btn-primary w-full text-sm">
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {order.status === "delivered" && (
        <div className="card space-y-3 p-4">
          <p className="text-sm font-semibold">Rate the dishes you ordered</p>
          {order.items.map((item) => {
            const foodId = item.food?._id || item.food;
            const isSubmitted = submittedFoodIds.has(foodId);
            const currentRating = foodRatings[foodId] || 0;
            return (
              <div key={foodId} className="flex items-center gap-3 border-t border-ink-900/5 pt-3 first:border-t-0 first:pt-0">
                <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <p className="min-w-0 flex-1 truncate text-sm">{item.name}</p>
                {isSubmitted ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="h-3.5 w-3.5" /> Rated
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFoodRatings((prev) => ({ ...prev, [foodId]: n }))}
                        >
                          <Star className={`h-4 w-4 ${n <= currentRating ? "fill-brand-500 text-brand-500" : "text-ink-900/20"}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => submitFoodReview(foodId)}
                      disabled={!currentRating || submittingFoodId === foodId}
                      className="rounded-lg bg-brand-500 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
                    >
                      {submittingFoodId === foodId ? "..." : "Rate"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Link to="/orders" className="block text-center text-sm text-ink-900/50">
        ← Back to all orders
      </Link>
    </div>
  );
};

export default OrderDetails;
