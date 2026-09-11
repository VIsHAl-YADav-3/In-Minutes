import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import { buildValidatedOrder } from "../utils/buildOrder.js";
import { notifyUser } from "../utils/notify.js";

// @desc  Customer: place a Cash on Delivery order
// @route POST /api/orders/cod
export const placeCodOrder = asyncHandler(async (req, res) => {
  const { items, restaurantId, deliveryAddress } = req.body;
  if (!deliveryAddress?.fullAddress) {
    res.status(400);
    throw new Error("Delivery address is required");
  }

  const { restaurant, orderItems, itemsTotal, deliveryFee, taxes, totalAmount } = await buildValidatedOrder({
    items,
    restaurantId,
  });

  const order = await Order.create({
    customer: req.user._id,
    restaurant: restaurant._id,
    items: orderItems,
    deliveryAddress,
    itemsTotal,
    deliveryFee,
    taxes,
    totalAmount,
    paymentMethod: "cod",
    paymentStatus: "cod",
    status: "placed",
  });

  const io = req.app.get("io");
  await notifyUser(io, {
    userId: req.user._id,
    title: "Order Placed",
    message: `Your order from ${restaurant.name} has been placed. Pay ₹${totalAmount} on delivery.`,
    type: "order_placed",
    relatedOrder: order._id,
  });
  await notifyUser(io, {
    userId: restaurant.owner,
    title: "New Order Received",
    message: `New COD order (₹${totalAmount}) from ${req.user.name}.`,
    type: "order_placed",
    relatedOrder: order._id,
  });

  res.status(201).json({ success: true, order });
});

// @desc  Customer: my orders (current + past)
// @route GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate("restaurant", "name coverImage profileImage")
    .sort({ createdAt: -1 });

  const active = ["placed", "accepted", "preparing", "out_for_delivery"];
  res.json({
    success: true,
    current: orders.filter((o) => active.includes(o.status)),
    past: orders.filter((o) => !active.includes(o.status)),
  });
});

// @desc  Get single order (customer owner, restaurant owner, or admin)
// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("restaurant", "name owner coverImage profileImage contact")
    .populate("customer", "name email phone");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isCustomer = String(order.customer._id) === String(req.user._id);
  const isRestaurantOwner = String(order.restaurant.owner) === String(req.user._id);
  if (!isCustomer && !isRestaurantOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to view this order");
  }

  res.json({ success: true, order });
});

// @desc  Seller: orders for my restaurant
// @route GET /api/orders/restaurant/:restaurantId
export const getRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, isDeleted: false });
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only view orders for your own restaurant");
  }

  const orders = await Order.find({ restaurant: restaurant._id })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

const VALID_TRANSITIONS = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// @desc  Seller: update order status
// @route PATCH /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("restaurant", "owner name");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (String(order.restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage orders for your own restaurant");
  }

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Cannot move order from "${order.status}" to "${status}"`);
  }

  order.status = status;
  await order.save();

  const statusLabels = {
    accepted: "Restaurant accepted your order",
    preparing: "Your order is being prepared",
    out_for_delivery: "Your order is out for delivery",
    delivered: "Your order has been delivered",
    cancelled: "Your order was cancelled",
  };

  await notifyUser(req.app.get("io"), {
    userId: order.customer,
    title: statusLabels[status] || "Order Update",
    message: `Order from ${order.restaurant.name}: ${statusLabels[status] || status}`,
    type: status === "accepted" ? "order_accepted" : "order_status",
    relatedOrder: order._id,
  });

  res.json({ success: true, order });
});

// @desc  Customer: cancel own order (only while still placed)
// @route PATCH /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (String(order.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only cancel your own orders");
  }
  if (!["placed", "accepted"].includes(order.status)) {
    res.status(400);
    throw new Error("This order can no longer be cancelled");
  }
  order.status = "cancelled";
  await order.save();
  res.json({ success: true, order });
});

// @desc  Admin: all orders
// @route GET /api/admin/orders
export const adminGetOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("restaurant", "name")
    .populate("customer", "name email")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json({ success: true, orders });
});
