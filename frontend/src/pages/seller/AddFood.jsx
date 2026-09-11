import { useEffect, useState } from "react";
import { ImagePlus, PlusCircle, CheckCircle2 } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CATEGORIES = ["Pizza", "Burger", "Momos", "Pasta", "Sandwich", "French Fries", "Cold Coffee", "Biryani", "Desserts", "Beverages", "Other"];

const AddFood = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [foodCount, setFoodCount] = useState(0);
  const [maxFoodItems, setMaxFoodItems] = useState(50);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: CATEGORIES[0] });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/restaurants/mine");
      setRestaurant(res.data.restaurant);
      setFoodCount(res.data.foodCount || 0);
      setMaxFoodItems(res.data.maxFoodItems || 50);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: CATEGORIES[0] });
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please upload a food image");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", image);
      const res = await api.post(`/food/${restaurant._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFoodCount(res.data.foodCount);
      setJustAdded(form.name);
      toast.success(`${form.name} added to your menu!`);
      resetForm();
      setTimeout(() => setJustAdded(""), 3000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (!restaurant) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="No restaurant yet"
        description="Create your restaurant first before adding food items."
        action={<Link to="/become-a-seller" className="btn-primary">Start Onboarding</Link>}
      />
    );
  }

  const atLimit = foodCount >= maxFoodItems;

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-10">
      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold">Food Items</p>
          <p className="text-xs text-ink-900/50">You can add anywhere from 1 up to {maxFoodItems} items — no minimum required.</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-brand-600">{foodCount} / {maxFoodItems}</p>
        </div>
      </div>

      {atLimit ? (
        <div className="card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You have reached the maximum limit of {maxFoodItems} food items for this restaurant.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="card flex h-36 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden border-2 border-dashed border-ink-900/15 text-xs text-ink-900/50">
            {preview ? (
              <img src={preview} alt="Food preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" /> Upload Food Image
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          <div>
            <label className="label">Food Name</label>
            <input required className="input" value={form.name} onChange={update("name")} placeholder="e.g. Margherita Pizza" />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input" value={form.description} onChange={update("description")} placeholder="Ingredients, spice level, etc." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹)</label>
              <input required type="number" min="0" step="1" className="input" value={form.price} onChange={update("price")} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={update("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? "Saving..." : "Save Food Item"}
          </button>
        </form>
      )}

      {justAdded && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700 animate-fadeUp">
          <CheckCircle2 className="h-4 w-4" /> "{justAdded}" added. Add another item whenever you're ready.
        </div>
      )}

      <Link to="/seller/manage-food" className="block text-center text-sm text-ink-900/50">
        View & manage all food items →
      </Link>
    </div>
  );
};

export default AddFood;
