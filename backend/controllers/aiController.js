import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import { getVishalReply } from "../utils/ai.js";

// @desc  Chat with Vishal AI support assistant
// @route POST /api/ai/vishal
export const chatWithVishal = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  const recentOrders = await Order.find({ customer: req.user._id })
    .populate("restaurant", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const context = {
    recentOrders: recentOrders.map((o) => ({
      _id: o._id,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      restaurantName: o.restaurant?.name,
    })),
  };

  const reply = await getVishalReply({ message, context });

  res.json({ success: true, reply });
});
