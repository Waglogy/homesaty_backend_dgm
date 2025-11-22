import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [2, "Full name must be at least 2 characters long"],
        maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        index: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please provide a valid phone number"],
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, "Address cannot exceed 500 characters"],
        default: "",
    },
    visitDate: {
        type: Date,
        required: [true, "Visit date is required"],
        index: true,
    },
    accommodationType: {
        type: String,
        required: [true, "Accommodation type is required"],
        enum: {
            values: [
                "Luxury Glamping Tent",
                "Authentic Homestay",
                "Mountain Wellness Pod"
            ],
            message: "Accommodation type must be one of: Luxury Glamping Tent, Authentic Homestay, Mountain Wellness Pod",
        },
    },
    status: {
        type: String,
        enum: ["active", "inactive", "completed"],
        default: "active",
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, "Notes cannot exceed 1000 characters"],
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
guestSchema.index({ email: 1, visitDate: -1 });
guestSchema.index({ visitDate: -1 });
guestSchema.index({ accommodationType: 1 });
guestSchema.index({ status: 1 });

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;

