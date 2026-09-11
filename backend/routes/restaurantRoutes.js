import express from "express";
import {
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
  toggleRestaurantStatus,
  deleteRestaurant,
} from "../controllers/restaurantController.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const restaurantImageUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);

router.get("/", getRestaurants);
router.get("/mine", protect, getMyRestaurant);
router.get("/:id", optionalAuth, getRestaurantById);

router.post("/", protect, restaurantImageUpload, createRestaurant);
router.put("/:id", protect, restaurantImageUpload, updateRestaurant);
router.patch("/:id/status", protect, authorize("seller", "admin"), toggleRestaurantStatus);
router.delete("/:id", protect, authorize("seller", "admin"), deleteRestaurant);

export default router;
