import Review from "../models/Review.js";
import { validationResult } from "express-validator";

// Create Review (POST)
export const createReview = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { fullName, email, location, review, rating } = req.body;

        // Create new review
        const newReview = await Review.create({
            fullName,
            email,
            location,
            review,
            rating: rating || 5,
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully. It will be published after approval.",
            data: {
                review: {
                    id: newReview._id,
                    fullName: newReview.fullName,
                    email: newReview.email,
                    location: newReview.location,
                    review: newReview.review,
                    rating: newReview.rating,
                    status: newReview.status,
                    isApproved: newReview.isApproved,
                    createdAt: newReview.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get All Reviews (GET) - Admin only
export const getReviews = async (req, res) => {
    try {
        const { status, isApproved, rating, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (isApproved !== undefined) filter.isApproved = isApproved === "true";
        if (rating) filter.rating = parseInt(rating);

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get reviews with pagination
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v");

        // Get total count for pagination
        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving reviews",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Single Review (GET) - Public for approved reviews, admin can access all
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id).select("-__v");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // For public access (non-admin), only show approved reviews
        // Hide email for public access
        if (!req.admin) {
            if (review.status !== "approved" || !review.isApproved) {
                return res.status(403).json({
                    success: false,
                    message: "Review not found or not approved",
                });
            }
            // Remove email from response for public access
            review.email = undefined;
        }

        res.status(200).json({
            success: true,
            message: "Review retrieved successfully",
            data: {
                review,
            },
        });
    } catch (error) {
        console.error("Get review error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Update Review (PUT)
export const updateReview = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { id } = req.params;
        const { fullName, email, location, review, rating, status, isApproved } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email;
        if (location !== undefined) updateData.location = location;
        if (review !== undefined) updateData.review = review;
        if (rating !== undefined) updateData.rating = rating;
        if (status !== undefined) updateData.status = status;
        if (isApproved !== undefined) {
            updateData.isApproved = isApproved;
            // Automatically set status based on isApproved
            if (isApproved) {
                updateData.status = "approved";
            } else if (updateData.status !== "rejected") {
                updateData.status = "pending";
            }
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-__v");

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: {
                review: updatedReview,
            },
        });
    } catch (error) {
        console.error("Update review error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Delete Review (DELETE)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: {
                id: review._id,
            },
        });
    } catch (error) {
        console.error("Delete review error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Approve Review (PATCH)
export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { 
                isApproved: true,
                status: "approved"
            },
            { new: true }
        ).select("-__v");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review approved successfully",
            data: {
                review,
            },
        });
    } catch (error) {
        console.error("Approve review error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error approving review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Reject Review (PATCH)
export const rejectReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { 
                isApproved: false,
                status: "rejected"
            },
            { new: true }
        ).select("-__v");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review rejected successfully",
            data: {
                review,
            },
        });
    } catch (error) {
        console.error("Reject review error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error rejecting review",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Approved Reviews (Public - GET)
export const getApprovedReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get only approved reviews
        const reviews = await Review.find({
            status: "approved",
            isApproved: true,
        })
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v -email");

        // Get total count
        const total = await Review.countDocuments({
            status: "approved",
            isApproved: true,
        });

        res.status(200).json({
            success: true,
            message: "Approved reviews retrieved successfully",
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Get approved reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving approved reviews",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

