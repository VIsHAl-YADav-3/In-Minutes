import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc  Register a new customer
// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user: user.toSafeObject() });
});

// @desc  Login
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  const token = generateToken(user._id);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc  Get current user
// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc  Update profile
// @route PUT /api/auth/me
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  if (avatar) req.user.avatar = avatar;
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

// ---- Address management ----

export const addAddress = asyncHandler(async (req, res) => {
  const { label, fullAddress, city, state, pincode, landmark, isDefault } = req.body;
  if (!fullAddress) {
    res.status(400);
    throw new Error("Address is required");
  }
  if (isDefault) {
    req.user.addresses.forEach((a) => (a.isDefault = false));
  }
  req.user.addresses.push({ label, fullAddress, city, state, pincode, landmark, isDefault });
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.addressId);
  if (!addr) {
    res.status(404);
    throw new Error("Address not found");
  }
  Object.assign(addr, req.body);
  if (req.body.isDefault) {
    req.user.addresses.forEach((a) => {
      if (String(a._id) !== req.params.addressId) a.isDefault = false;
    });
  }
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.addressId);
  if (!addr) {
    res.status(404);
    throw new Error("Address not found");
  }
  addr.deleteOne();
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});
