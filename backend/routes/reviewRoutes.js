import express from "express";
import { createReview, getRestaurantReviews, getFoodReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.get("/food/:foodId", getFoodReviews);

export default router;
