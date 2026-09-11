import express from "express";
import {
  placeCodOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/cod", protect, placeCodOrder);
router.get("/mine", protect, getMyOrders);
router.get("/restaurant/:restaurantId", protect, authorize("seller", "admin"), getRestaurantOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, authorize("seller", "admin"), updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
