import express from "express";
import rateLimit from "express-rate-limit";
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
} from "../controllers/AdminController.js";
import { protect } from "../middleware/auth.js";
import {
    validateAdminRegistration,
    validateAdminLogin,
} from "../middleware/validators.js";

const router = express.Router();

// Stricter rate limiting for auth endpoints (to prevent brute force attacks)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // When trust proxy is enabled, Express automatically uses X-Forwarded-For to set req.ip
        return req.ip || req.socket.remoteAddress || 'unknown';
    },
    validate: {
        trustProxy: true, // Trust proxy headers
    },
});

// Public routes with strict rate limiting
router.post("/register", authLimiter, validateAdminRegistration, registerAdmin);
router.post("/login", authLimiter, validateAdminLogin, loginAdmin);

// Protected routes (protected by authentication middleware)
router.get("/profile", protect, getAdminProfile);

export default router;

