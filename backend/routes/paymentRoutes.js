import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  reportRazorpayFailure,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/failure", protect, reportRazorpayFailure);

export default router;
