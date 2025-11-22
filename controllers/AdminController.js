import Admin from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

// Admin Registration
export const registerAdmin = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists",
            });
        }

        // Create new admin
        const admin = await Admin.create({
            name,
            email,
            password,
        });

        // Generate token
        const token = generateToken(admin._id);

        // Remove password from response
        admin.password = undefined;

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering admin",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find admin by email and select password (since it's select: false by default)
        const admin = await Admin.findOne({ email }).select("+password");
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordCorrect = await admin.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Update last login
        await admin.updateLastLogin();

        // Generate token
        const token = generateToken(admin._id);

        // Remove password from response
        admin.password = undefined;

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in admin",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Current Admin Profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin profile",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

