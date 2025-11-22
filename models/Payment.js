import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: [true, "Booking ID is required"],
        index: true,
    },
    guestName: {
        type: String,
        required: [true, "Guest name is required"],
        trim: true,
        minlength: [2, "Guest name must be at least 2 characters long"],
        maxlength: [100, "Guest name cannot exceed 100 characters"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0.01, "Amount must be greater than 0"],
    },
    paymentDate: {
        type: Date,
        required: [true, "Payment date is required"],
        default: Date.now,
        index: true,
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: {
            values: [
                "UPI",
                "Credit Card",
                "Debit Card",
                "Bank Transfer",
                "Cash",
                "Other"
            ],
            message: "Payment method must be one of: UPI, Credit Card, Debit Card, Bank Transfer, Cash, Other",
        },
    },
    referenceTransactionId: {
        type: String,
        trim: true,
        maxlength: [200, "Reference/Transaction ID cannot exceed 200 characters"],
        default: "",
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "completed",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
paymentSchema.index({ bookingId: 1, paymentDate: -1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ referenceTransactionId: 1 }, { sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

