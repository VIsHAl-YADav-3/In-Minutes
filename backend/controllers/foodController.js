import asyncHandler from "express-async-handler";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const getOwnedRestaurantOrFail = async (restaurantId, user) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, isDeleted: false });
  if (!restaurant) {
    const err = new Error("Restaurant not found");
    err.status = 404;
    throw err;
  }
  if (String(restaurant.owner) !== String(user._id) && user.role !== "admin") {
    const err = new Error("You can only manage food items for your own restaurant");
    err.status = 403;
    throw err;
  }
  return restaurant;
};

// @desc  Seller: add a food item to own restaurant (flexible count, max 50)
// @route POST /api/food/:restaurantId
export const addFood = asyncHandler(async (req, res) => {
  const restaurant = await getOwnedRestaurantOrFail(req.params.restaurantId, req.user);

  const currentCount = await Food.countDocuments({ restaurant: restaurant._id, isDeleted: false });
  if (currentCount >= Restaurant.MAX_FOOD_ITEMS) {
    res.status(400);
    throw new Error(`You have reached the maximum limit of ${Restaurant.MAX_FOOD_ITEMS} food items for this restaurant.`);
  }

  const { name, description, price, category, isAvailable } = req.body;
  if (!name || !price || !category) {
    res.status(400);
    throw new Error("Food name, price, and category are required");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Food image is required");
  }

  const upload = await uploadBufferToCloudinary(req.file.buffer, "in-minutes/food");

  const food = await Food.create({
    restaurant: restaurant._id,
    owner: req.user._id,
    name,
    description,
    price: Number(price),
    category,
    image: upload.url,
    isAvailable: isAvailable === undefined ? true : isAvailable === "true" || isAvailable === true,
  });

  restaurant.foodCount = currentCount + 1;
  await restaurant.save();

  res.status(201).json({
    success: true,
    food,
    foodCount: restaurant.foodCount,
    maxFoodItems: Restaurant.MAX_FOOD_ITEMS,
  });
});

// @desc  Seller: get all food for own restaurant (management view, includes unavailable)
// @route GET /api/food/manage/:restaurantId
export const getMyRestaurantFood = asyncHandler(async (req, res) => {
  const restaurant = await getOwnedRestaurantOrFail(req.params.restaurantId, req.user);
  const foods = await Food.find({ restaurant: restaurant._id, isDeleted: false }).sort({ createdAt: -1 });
  res.json({ success: true, foods, foodCount: foods.length, maxFoodItems: Restaurant.MAX_FOOD_ITEMS });
});

// @desc  Seller: update a food item
// @route PUT /api/food/:id
export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, isDeleted: false });
  if (!food) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (String(food.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage your own food items");
  }

  const { name, description, price, category, isAvailable } = req.body;
  if (name !== undefined) food.name = name;
  if (description !== undefined) food.description = description;
  if (price !== undefined) food.price = Number(price);
  if (category !== undefined) food.category = category;
  if (isAvailable !== undefined) food.isAvailable = isAvailable === "true" || isAvailable === true;

  if (req.file) {
    const upload = await uploadBufferToCloudinary(req.file.buffer, "in-minutes/food");
    food.image = upload.url;
  }

  await food.save();
  res.json({ success: true, food });
});

// @desc  Seller: toggle food availability (Available / Out of Stock)
// @route PATCH /api/food/:id/availability
export const toggleFoodAvailability = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, isDeleted: false });
  if (!food) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (String(food.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage your own food items");
  }
  food.isAvailable = req.body.isAvailable !== undefined ? !!req.body.isAvailable : !food.isAvailable;
  await food.save();
  res.json({ success: true, food });
});

// @desc  Seller: delete a food item
// @route DELETE /api/food/:id
export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, isDeleted: false });
  if (!food) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (String(food.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only manage your own food items");
  }

  food.isDeleted = true;
  await food.save();

  const restaurant = await Restaurant.findById(food.restaurant);
  if (restaurant) {
    const currentCount = await Food.countDocuments({ restaurant: restaurant._id, isDeleted: false });
    restaurant.foodCount = currentCount;
    await restaurant.save();
  }

  res.json({ success: true, message: "Food item deleted" });
});

// @desc  Public: search food items across the platform
// @route GET /api/food/search?q=
export const searchFood = asyncHandler(async (req, res) => {
  const { q, category, page = 1, limit = 20 } = req.query;
  const filter = { isDeleted: false };
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const foods = await Food.find(filter)
    .populate("restaurant", "name isOpen approvalStatus isDeleted")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const visible = foods.filter(
    (f) => f.restaurant && !f.restaurant.isDeleted && f.restaurant.approvalStatus === "approved"
  );

  res.json({ success: true, foods: visible });
});
