import jwt from "jsonwebtoken";
import Admin from "../models/User.js";

// Protect routes - Authentication middleware
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route. Please provide a token.",
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get admin from token
            req.admin = await Admin.findById(decoded.id);
            
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: "Admin not found with this token",
                });
            }

            next();
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token",
                });
            }
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please login again.",
                });
            }
            throw error;
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Role-based authorization (for future use if needed)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Admin role '${req.admin.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

