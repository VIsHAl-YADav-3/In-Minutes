import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "order_placed",
        "payment_success",
        "payment_failed",
        "cod_confirmed",
        "order_accepted",
        "order_status",
        "restaurant_approved",
        "restaurant_rejected",
        "general",
      ],
      default: "general",
    },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
