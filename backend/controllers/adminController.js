import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalRestaurants, totalFoodItems, orders] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "seller" }),
    Restaurant.countDocuments({ isDeleted: false }),
    Food.countDocuments({ isDeleted: false }),
    Order.find(),
  ]);

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const onlinePayments = orders.filter((o) => o.paymentMethod === "razorpay" && o.paymentStatus === "paid").length;
  const codOrders = orders.filter((o) => o.paymentMethod === "cod").length;

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalSellers,
      totalRestaurants,
      totalFoodItems,
      totalOrders,
      totalRevenue,
      onlinePayments,
      codOrders,
    },
  });
});

// @desc  Admin: list users
// @route GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc  Admin: activate/deactivate a user
// @route PATCH /api/admin/users/:id/status
export const setUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = req.body.isActive !== undefined ? !!req.body.isActive : !user.isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Admin: list all food items
// @route GET /api/admin/food
export const getAllFood = asyncHandler(async (req, res) => {
  const foods = await Food.find({ isDeleted: false }).populate("restaurant", "name").sort({ createdAt: -1 });
  res.json({ success: true, foods });
});

// @desc  Admin: list all reviews
// @route GET /api/admin/reviews
export const getAllReviews = asyncHandler(async (req, res) => {
  const Review = (await import("../models/Review.js")).default;
  const reviews = await Review.find()
    .populate("user", "name")
    .populate("restaurant", "name")
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ success: true, reviews });
});
