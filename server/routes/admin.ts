import { Router } from "express";
import { Admin } from "../models/Admin";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";

// Register admin
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin email already registered" });
    }

    const admin = new Admin({
      email,
      password,
      firstName,
      lastName,
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ error: "Admin registration failed" });
  }
});

// Login admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const admin = (await Admin.findOne({ email })) as any;
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// Get all admins
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ error: "Failed to get admins" });
  }
});

// Get admin profile
router.get("/profile", async (req, res) => {
  try {
    const adminId = (req as any).userId;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ error: "Failed to get admin profile" });
  }
});

// Update admin profile
router.put("/profile", async (req, res) => {
  try {
    const adminId = (req as any).userId;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, permissions } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { firstName, lastName, permissions },
      { new: true }
    ).select("-password");

    res.json({
      message: "Admin profile updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ error: "Failed to update admin profile" });
  }
});

// Deactivate user (admin only)
router.put("/deactivate-user/:id", async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-password");

    res.json({
      message: "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// Delete admin
router.delete("/:id", async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    await Admin.findByIdAndDelete(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

export default router;
