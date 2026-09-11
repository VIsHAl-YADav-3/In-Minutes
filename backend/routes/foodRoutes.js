import express from "express";
import {
  addFood,
  getMyRestaurantFood,
  updateFood,
  toggleFoodAvailability,
  deleteFood,
  searchFood,
} from "../controllers/foodController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/search", searchFood);
router.get("/manage/:restaurantId", protect, authorize("seller", "admin"), getMyRestaurantFood);

router.post("/:restaurantId", protect, authorize("seller", "admin"), upload.single("image"), addFood);
router.put("/:id", protect, authorize("seller", "admin"), upload.single("image"), updateFood);
router.patch("/:id/availability", protect, authorize("seller", "admin"), toggleFoodAvailability);
router.delete("/:id", protect, authorize("seller", "admin"), deleteFood);

export default router;
