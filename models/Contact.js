import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
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
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true,
        minlength: [5, "Subject must be at least 5 characters long"],
        maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        minlength: [10, "Message must be at least 10 characters long"],
        maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
        type: String,
        enum: ["new", "read", "replied", "closed"],
        default: "new",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    emailSent: {
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

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
