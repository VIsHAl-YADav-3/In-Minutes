import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";
import User from "../models/User.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { notifyUser } from "../utils/notify.js";

// @desc  Public: list approved, non-deleted restaurants (search/filter/paginate)
// @route GET /api/restaurants
export const getRestaurants = asyncHandler(async (req, res) => {
  const { q, category, status, sort, page = 1, limit = 12 } = req.query;

  const filter = { isDeleted: false, approvalStatus: "approved" };
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (status === "open") filter.isOpen = true;
  if (status === "closed") filter.isOpen = false;

  let sortOption = { createdAt: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "popular") sortOption = { numReviews: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
    Restaurant.countDocuments(filter),
  ]);

  res.json({
    success: true,
    restaurants,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @desc  Public: get single restaurant + its available food menu
// @route GET /api/restaurants/:id
export const getRestaurantById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Only expose non-approved restaurants to their owner or an admin
  const isOwnerOrAdmin =
    req.user && (String(restaurant.owner) === String(req.user._id) || req.user.role === "admin");
  if (restaurant.approvalStatus !== "approved" && !isOwnerOrAdmin) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const foods = await Food.find({ restaurant: restaurant._id, isDeleted: false }).sort({ createdAt: -1 });

  res.json({ success: true, restaurant, foods });
});

// @desc  Seller: get my restaurant
// @route GET /api/restaurants/mine
export const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id, isDeleted: false });
  if (!restaurant) {
    return res.json({ success: true, restaurant: null });
  }
  const foodCount = await Food.countDocuments({ restaurant: restaurant._id, isDeleted: false });
  res.json({ success: true, restaurant, foodCount, maxFoodItems: Restaurant.MAX_FOOD_ITEMS });
});

// @desc  Customer -> Become a Seller: create restaurant (starts onboarding)
// @route POST /api/restaurants
export const createRestaurant = asyncHandler(async (req, res) => {
  const existing = await Restaurant.findOne({ owner: req.user._id, isDeleted: false });
  if (existing) {
    res.status(400);
    throw new Error("You already have a restaurant. Each seller can manage one restaurant.");
  }

  const { name, description, location, address, contact, category } = req.body;
  if (!name || !description || !location || !address || !contact || !category) {
    res.status(400);
    throw new Error("All restaurant fields are required");
  }

  if (!req.files?.coverImage?.[0] || !req.files?.profileImage?.[0]) {
    res.status(400);
    throw new Error("Cover image and profile image are required");
  }

  const [coverUpload, profileUpload] = await Promise.all([
    uploadBufferToCloudinary(req.files.coverImage[0].buffer, "in-minutes/restaurants"),
    uploadBufferToCloudinary(req.files.profileImage[0].buffer, "in-minutes/restaurants"),
  ]);

  const restaurant = await Restaurant.create({
    owner: req.user._id,
    name,
    description,
    location,
    address,
    contact,
    category,
    coverImage: coverUpload.url,
    profileImage: profileUpload.url,
    approvalStatus: "pending",
  });

  req.user.role = "seller";
  req.user.sellerStatus = "pending";
  await req.user.save();

  res.status(201).json({ success: true, restaurant });
});

// @desc  Seller: update own restaurant
// @route PUT /api/restaurants/:id
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isDeleted: false });
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage your own restaurant");
  }

  const fields = ["name", "description", "location", "address", "contact", "category"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) restaurant[f] = req.body[f];
  });

  if (req.files?.coverImage?.[0]) {
    const upload = await uploadBufferToCloudinary(req.files.coverImage[0].buffer, "in-minutes/restaurants");
    restaurant.coverImage = upload.url;
  }
  if (req.files?.profileImage?.[0]) {
    const upload = await uploadBufferToCloudinary(req.files.profileImage[0].buffer, "in-minutes/restaurants");
    restaurant.profileImage = upload.url;
  }

  await restaurant.save();
  res.json({ success: true, restaurant });
});

// @desc  Seller: toggle open/closed
// @route PATCH /api/restaurants/:id/status
export const toggleRestaurantStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isDeleted: false });
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage your own restaurant");
  }
  restaurant.isOpen = req.body.isOpen !== undefined ? !!req.body.isOpen : !restaurant.isOpen;
  await restaurant.save();
  res.json({ success: true, restaurant });
});

// @desc  Seller/Admin: delete restaurant (soft delete, cascades food)
// @route DELETE /api/restaurants/:id
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isDeleted: false });
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only delete your own restaurant");
  }

  restaurant.isDeleted = true;
  await restaurant.save();

  // Safe cleanup: soft-delete associated food items to avoid orphan records
  await Food.updateMany({ restaurant: restaurant._id }, { $set: { isDeleted: true } });

  res.json({ success: true, message: "Restaurant deleted successfully" });
});

// @desc  Admin: list all restaurants (including pending/rejected)
// @route GET /api/admin/restaurants
export const adminGetRestaurants = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { isDeleted: false };
  if (status) filter.approvalStatus = status;
  const restaurants = await Restaurant.find(filter).populate("owner", "name email").sort({ createdAt: -1 });
  res.json({ success: true, restaurants });
});

// @desc  Admin: approve/reject a restaurant
// @route PATCH /api/admin/restaurants/:id/approval
export const setRestaurantApproval = asyncHandler(async (req, res) => {
  const { status } = req.body; // "approved" | "rejected"
  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  restaurant.approvalStatus = status;
  await restaurant.save();

  await User.findByIdAndUpdate(restaurant.owner, {
    sellerStatus: status,
  });

  await notifyUser(req.app.get("io"), {
    userId: restaurant.owner,
    title: status === "approved" ? "Restaurant Approved 🎉" : "Restaurant Application Update",
    message:
      status === "approved"
        ? `${restaurant.name} is now live on In Minutes!`
        : `${restaurant.name} was not approved. Please review your details and contact support.`,
    type: status === "approved" ? "restaurant_approved" : "restaurant_rejected",
  });

  res.json({ success: true, restaurant });
});
