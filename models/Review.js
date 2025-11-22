import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [2, "Full name must be at least 2 characters long"],
        maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Email address is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
        minlength: [2, "Location must be at least 2 characters long"],
        maxlength: [100, "Location cannot exceed 100 characters"],
    },
    review: {
        type: String,
        required: [true, "Review is required"],
        trim: true,
        minlength: [10, "Review must be at least 10 characters long"],
        maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for better query performance
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ email: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;

