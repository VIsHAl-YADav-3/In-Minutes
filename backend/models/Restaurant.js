import mongoose from "mongoose";

const MAX_FOOD_ITEMS = 50;

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true }, // e.g. "North Indian", "Cafe"
    location: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    coverImage: { type: String, required: true },
    profileImage: { type: String, required: true },

    isOpen: { type: Boolean, default: true },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    foodCount: { type: Number, default: 0, max: MAX_FOOD_ITEMS },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", location: "text", category: "text" });

restaurantSchema.statics.MAX_FOOD_ITEMS = MAX_FOOD_ITEMS;

export default mongoose.model("Restaurant", restaurantSchema);
