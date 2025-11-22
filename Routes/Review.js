import express from "express";
import {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
    approveReview,
    rejectReview,
    getApprovedReviews,
} from "../controllers/ReviewController.js";
import { protect } from "../middleware/auth.js";
import {
    validateReview,
    validateReviewUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.post("/", validateReview, createReview);
router.get("/approved", getApprovedReviews); // Public endpoint for approved reviews only

// Protected routes - Admin only
router.get("/", protect, getReviews);
router.get("/:id", getReviewById); // Can be accessed publicly for approved reviews, admin can access all
router.put("/:id", protect, validateReviewUpdate, updateReview);
router.delete("/:id", protect, deleteReview);
router.patch("/:id/approve", protect, approveReview);
router.patch("/:id/reject", protect, rejectReview);

export default router;

