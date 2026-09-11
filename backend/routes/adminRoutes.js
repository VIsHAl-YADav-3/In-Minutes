import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getDashboardStats, getUsers, setUserActive, getAllFood, getAllReviews } from "../controllers/adminController.js";
import { adminGetRestaurants, setRestaurantApproval } from "../controllers/restaurantController.js";
import { adminGetOrders } from "../controllers/orderController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);

router.get("/users", getUsers);
router.patch("/users/:id/status", setUserActive);

router.get("/restaurants", adminGetRestaurants);
router.patch("/restaurants/:id/approval", setRestaurantApproval);

router.get("/food", getAllFood);
router.get("/orders", adminGetOrders);
router.get("/reviews", getAllReviews);

export default router;
