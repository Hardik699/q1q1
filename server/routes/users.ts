import { Router, RequestHandler } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";

// Register user
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user profile
export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update user profile
export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, address },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Get all users (admin only)
export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
};

// Delete user (admin only)
export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.get("/profile", handleGetProfile);
router.put("/profile", handleUpdateProfile);
router.get("/", handleGetAllUsers);
router.delete("/:id", handleDeleteUser);

export default router;
