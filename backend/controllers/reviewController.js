import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";

const recalcRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

const recalcFoodRating = async (foodId) => {
  const stats = await Review.aggregate([
    { $match: { food: foodId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Food.findByIdAndUpdate(foodId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

// @desc  Customer: write a review (restaurant and/or food)
// @route POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { restaurantId, foodId, orderId, rating, comment } = req.body;
  if (!rating || (!restaurantId && !foodId)) {
    res.status(400);
    throw new Error("Rating and a restaurant or food item are required");
  }

  const review = await Review.create({
    user: req.user._id,
    restaurant: restaurantId || undefined,
    food: foodId || undefined,
    order: orderId || undefined,
    rating,
    comment,
  });

  if (restaurantId) await recalcRestaurantRating(restaurantId);
  if (foodId) await recalcFoodRating(foodId);

  res.status(201).json({ success: true, review });
});

// @desc  Public: get reviews for a restaurant
// @route GET /api/reviews/restaurant/:restaurantId
export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc  Public: get reviews for a food item
// @route GET /api/reviews/food/:foodId
export const getFoodReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ food: req.params.foodId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});
