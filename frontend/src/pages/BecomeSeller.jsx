import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ImagePlus, Clock } from "lucide-react";
import api, { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const CATEGORIES = ["North Indian", "South Indian", "Chinese", "Italian", "Fast Food", "Cafe", "Desserts", "Healthy", "Multi-Cuisine"];

const BecomeSeller = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    contact: "",
    category: CATEGORIES[0],
  });
  const [coverImage, setCoverImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFile = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverImage || !profileImage) {
      toast.error("Please upload both a cover image and a profile image");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("coverImage", coverImage);
      fd.append("profileImage", profileImage);

      await api.post("/restaurants", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      setDone(true);
      toast.success("Restaurant created! Redirecting to Add Food Menu...");
      setTimeout(() => navigate("/seller/add-food"), 1200);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Store className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-display text-xl font-bold">Restaurant created!</h1>
        <p className="mt-1.5 text-sm text-ink-900/60">Taking you to Add Food Menu...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Become a Seller</h1>
        <p className="mt-1 text-sm text-ink-900/60">Set up your restaurant on In Minutes. It only takes a minute.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-800">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        Your restaurant will be reviewed by our team before it goes live. You can start adding your menu right away while you wait.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="card flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden border-2 border-dashed border-ink-900/15 text-xs text-ink-900/50">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" /> Cover Image
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile(setCoverImage, setCoverPreview)} />
          </label>
          <label className="card flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden border-2 border-dashed border-ink-900/15 text-xs text-ink-900/50">
            {profilePreview ? (
              <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" /> Profile Image
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile(setProfileImage, setProfilePreview)} />
          </label>
        </div>

        <div>
          <label className="label">Restaurant Name</label>
          <input required className="input" value={form.name} onChange={update("name")} placeholder="e.g. Vishal's Food Corner" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea required rows={3} className="input" value={form.description} onChange={update("description")} placeholder="Tell customers what makes your food special" />
        </div>

        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={update("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Location (area / city)</label>
          <input required className="input" value={form.location} onChange={update("location")} placeholder="e.g. Koramangala, Bengaluru" />
        </div>

        <div>
          <label className="label">Full Address</label>
          <textarea required rows={2} className="input" value={form.address} onChange={update("address")} />
        </div>

        <div>
          <label className="label">Contact Number</label>
          <input required className="input" value={form.contact} onChange={update("contact")} placeholder="+91 90000 00000" />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? "Creating restaurant..." : "Create Restaurant & Continue"}
        </button>
      </form>
    </div>
  );
};

export default BecomeSeller;
