import asyncHandler from "express-async-handler";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// @desc  Upload a single generic image (e.g. avatar)
// @route POST /api/upload/image
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }
  const result = await uploadBufferToCloudinary(req.file.buffer, "in-minutes/misc");
  res.json({ success: true, url: result.url });
});
