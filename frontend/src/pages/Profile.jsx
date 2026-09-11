import { useState } from "react";
import { User, MapPin, Plus, Trash2, Store } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", fullAddress: "", city: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/auth/me", { name, phone });
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    if (!newAddress.fullAddress.trim()) return toast.error("Enter an address");
    try {
      await api.post("/auth/me/addresses", newAddress);
      await refreshUser();
      setShowAddForm(false);
      setNewAddress({ label: "Home", fullAddress: "", city: "", pincode: "" });
      toast.success("Address added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/auth/me/addresses/${addressId}`);
      await refreshUser();
      toast.success("Address removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      <h1 className="font-display text-xl font-bold">Profile</h1>

      <div className="card space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {user.name?.[0]?.toUpperCase() || <User />}
          </div>
          <div>
            <p className="font-semibold">{user.email}</p>
            <p className="text-xs capitalize text-ink-900/50">{user.role} account</p>
          </div>
        </div>
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button onClick={saveProfile} disabled={saving} className="btn-primary w-full text-sm">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {user.role === "customer" && (
        <Link to="/become-a-seller" className="card flex items-center gap-3 p-4">
          <Store className="h-5 w-5 text-brand-500" />
          <div>
            <p className="text-sm font-semibold">Become a Seller</p>
            <p className="text-xs text-ink-900/50">Start selling your food on In Minutes</p>
          </div>
        </Link>
      )}

      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-ink-900/70">Delivery Addresses</h2>
        {(user.addresses || []).map((addr) => (
          <div key={addr._id} className="card flex items-start gap-3 p-3.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{addr.label}</p>
              <p className="text-xs text-ink-900/60">{addr.fullAddress}</p>
            </div>
            <button onClick={() => deleteAddress(addr._id)} className="p-1 text-ink-900/30 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {showAddForm ? (
          <div className="card space-y-2.5 p-3.5">
            <input className="input" placeholder="Label" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
            <textarea className="input" placeholder="Full address" rows={2} value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })} />
            <div className="grid grid-cols-2 gap-2.5">
              <input className="input" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              <input className="input" placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={addAddress} className="btn-primary flex-1 text-sm">Save</button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="btn-secondary w-full text-sm">
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </section>

      <button onClick={logout} className="w-full text-center text-sm font-medium text-red-600">
        Logout
      </button>
    </div>
  );
};

export default Profile;
