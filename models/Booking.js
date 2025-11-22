import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please provide a valid phone number"],
    },
    checkInDate: {
        type: Date,
        required: [true, "Check-in date is required"],
    },
    checkOutDate: {
        type: Date,
        required: [true, "Check-out date is required"],
        validate: {
            validator: function(value) {
                return value > this.checkInDate;
            },
            message: "Check-out date must be after check-in date",
        },
    },
    numberOfGuests: {
        type: Number,
        required: [true, "Number of guests is required"],
        min: [1, "Number of guests must be at least 1"],
        max: [10, "Number of guests cannot exceed 10"],
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
    accommodationPrice: {
        type: Number,
        required: true,
    },
    specialRequests: {
        type: String,
        trim: true,
        maxlength: [1000, "Special requests cannot exceed 1000 characters"],
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    numberOfNights: {
        type: Number,
        required: true,
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    bookingReference: {
        type: String,
        unique: true,
        // Required but generated in pre-save hook
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Generate booking reference before saving
bookingSchema.pre("save", async function(next) {
    // Always generate bookingReference if it doesn't exist
    if (!this.bookingReference || this.bookingReference === '') {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingReference = `BK${timestamp}${random}`;
    }

    // Calculate number of nights
    if (this.checkInDate && this.checkOutDate) {
        const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
        this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Set accommodation price based on type
    if (this.accommodationType && !this.accommodationPrice) {
        const priceMap = {
            "Luxury Glamping Tent": 6500,
            "Authentic Homestay": 3500,
            "Mountain Wellness Pod": 5000,
        };
        this.accommodationPrice = priceMap[this.accommodationType] || 0;
    }

    // Calculate total amount
    if (this.accommodationPrice && this.numberOfNights) {
        this.totalAmount = this.accommodationPrice * this.numberOfNights;
    }

    next();
});

// Indexes for better query performance
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

