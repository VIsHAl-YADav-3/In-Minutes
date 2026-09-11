import { useEffect, useState } from "react";
import { Edit2, Trash2, UtensilsCrossed } from "lucide-react";
import api, { getErrorMessage } from "../../api/client.js";
import EmptyState from "../../components/EmptyState.jsx";
import { FoodRowSkeleton } from "../../components/Skeletons.jsx";
import toast from "react-hot-toast";

const CATEGORIES = ["Pizza", "Burger", "Momos", "Pasta", "Sandwich", "French Fries", "Cold Coffee", "Biryani", "Desserts", "Beverages", "Other"];

const EditModal = ({ food, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: food.name, description: food.description, price: food.price, category: food.category });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const res = await api.put(`/food/${food._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      onSaved(res.data.food);
      toast.success("Food item updated");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h3 className="font-display text-lg font-semibold">Edit Food Item</h3>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
        <div className="grid grid-cols-2 gap-2.5">
          <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-xs" />
        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? "Saving..." : "Save"}</button>
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ManageFood = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get("/restaurants/mine").then((res) => {
      setRestaurant(res.data.restaurant);
      if (res.data.restaurant) {
        api.get(`/food/manage/${res.data.restaurant._id}`).then((r) => setFoods(r.data.foods)).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const toggleAvailability = async (food) => {
    try {
      const res = await api.patch(`/food/${food._id}/availability`, { isAvailable: !food.isAvailable });
      setFoods((prev) => prev.map((f) => (f._id === food._id ? res.data.food : f)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteFood = async (food) => {
    if (!confirm(`Delete "${food.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/food/${food._id}`);
      setFoods((prev) => prev.filter((f) => f._id !== food._id));
      toast.success("Food item deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <FoodRowSkeleton />
        <FoodRowSkeleton />
      </div>
    );
  }

  if (!restaurant || foods.length === 0) {
    return <EmptyState icon={UtensilsCrossed} title="No Food Items Available" description="Add your first food item to get started." />;
  }

  return (
    <div className="space-y-3 pb-10">
      {foods.map((food) => (
        <div key={food._id} className="card flex items-center gap-3 p-3">
          <img src={food.image} alt={food.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{food.name}</p>
            <p className="text-xs text-ink-900/50">₹{food.price} · {food.category}</p>
          </div>
          <button
            onClick={() => toggleAvailability(food)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              food.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {food.isAvailable ? "Available" : "Out of Stock"}
          </button>
          <button onClick={() => setEditing(food)} className="p-1.5 text-ink-900/40 hover:text-brand-600">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => deleteFood(food)} className="p-1.5 text-ink-900/40 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {editing && (
        <EditModal
          food={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)))}
        />
      )}
    </div>
  );
};

export default ManageFood;
