/**
 * Run with: node utils/seedAdmin.js
 * Creates (or promotes) the admin account defined in .env (ADMIN_EMAIL / ADMIN_PASSWORD).
 */
import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@inminutes.app").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  let admin = await User.findOne({ email });
  if (admin) {
    admin.role = "admin";
    admin.isActive = true;
    await admin.save();
    console.log(`Promoted existing user to admin: ${email}`);
  } else {
    admin = await User.create({ name: "Admin", email, password, role: "admin" });
    console.log(`Created admin account: ${email} / ${password}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
