import express from "express";
import { chatWithVishal } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/vishal", protect, chatWithVishal);

export default router;
