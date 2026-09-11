import asyncHandler from "express-async-handler";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import { buildValidatedOrder } from "../utils/buildOrder.js";
import { notifyUser } from "../utils/notify.js";

// In-memory pending-order cache keyed by razorpay order id, so we only
// create the real Order document *after* payment is verified (prevents
// duplicate/abandoned orders). For a multi-instance deployment, swap this
// for a short-TTL collection or Redis.
const pendingOrders = new Map();

// @desc  Customer: create a Razorpay order for the current cart
// @route POST /api/payments/razorpay/order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { items, restaurantId, deliveryAddress } = req.body;
  if (!deliveryAddress?.fullAddress) {
    res.status(400);
    throw new Error("Delivery address is required");
  }

  const validated = await buildValidatedOrder({ items, restaurantId });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(validated.totalAmount * 100), // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  pendingOrders.set(razorpayOrder.id, {
    customer: req.user._id,
    restaurantId: validated.restaurant._id,
    orderItems: validated.orderItems,
    itemsTotal: validated.itemsTotal,
    deliveryFee: validated.deliveryFee,
    taxes: validated.taxes,
    totalAmount: validated.totalAmount,
    deliveryAddress,
    createdAt: Date.now(),
  });

  res.json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Customer: verify payment signature & create the confirmed order
// @route POST /api/payments/razorpay/verify
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing payment verification details");
  }

  const pending = pendingOrders.get(razorpay_order_id);
  if (!pending) {
    res.status(400);
    throw new Error("No matching pending order found, or it was already processed");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed. Signature mismatch.");
  }

  // Prevent duplicate order creation if verify is called twice
  pendingOrders.delete(razorpay_order_id);

  const order = await Order.create({
    customer: pending.customer,
    restaurant: pending.restaurantId,
    items: pending.orderItems,
    deliveryAddress: pending.deliveryAddress,
    itemsTotal: pending.itemsTotal,
    deliveryFee: pending.deliveryFee,
    taxes: pending.taxes,
    totalAmount: pending.totalAmount,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status: "placed",
  });

  const io = req.app.get("io");
  await notifyUser(io, {
    userId: order.customer,
    title: "Payment Successful",
    message: `Your payment of ₹${order.totalAmount} was successful. Order confirmed!`,
    type: "payment_success",
    relatedOrder: order._id,
  });

  const populated = await order.populate("restaurant", "owner name");
  await notifyUser(io, {
    userId: populated.restaurant.owner,
    title: "New Order Received",
    message: `New paid order (₹${order.totalAmount}) from your restaurant.`,
    type: "order_placed",
    relatedOrder: order._id,
  });

  res.status(201).json({ success: true, order });
});

// @desc  Customer: report a failed/cancelled Razorpay payment (for UX + notification)
// @route POST /api/payments/razorpay/failure
export const reportRazorpayFailure = asyncHandler(async (req, res) => {
  const { razorpay_order_id, reason } = req.body;
  pendingOrders.delete(razorpay_order_id);

  await notifyUser(req.app.get("io"), {
    userId: req.user._id,
    title: "Payment Failed",
    message: reason || "Your payment could not be completed. Please try again or choose Cash on Delivery.",
    type: "payment_failed",
  });

  res.json({ success: true });
});
