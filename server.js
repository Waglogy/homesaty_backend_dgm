import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import userRoutes from "./Routes/User.js";
import adminRoutes from "./Routes/Admin.js";
import contactRoutes from "./Routes/Contact.js";
import reviewRoutes from "./Routes/Review.js";
import bookingRoutes from "./Routes/Booking.js";
import guestRoutes from "./Routes/Guest.js";
import paymentRoutes from "./Routes/Payment.js";

dotenv.config();

const app = express();

// Trust proxy - Required for Vercel and other proxy servers
// This tells Express to trust the X-Forwarded-* headers from the proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
})); // Set various HTTP headers for security

// CORS Configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://daragharmaila.com",
    "https://www.daragharmaila.com",
    "http://localhost:3000",
    "http://localhost:3001",
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
}));

// Rate limiting (skip OPTIONS requests for CORS preflight)
// Custom keyGenerator to properly handle proxy headers (Vercel)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS", // Skip rate limiting for preflight requests
    keyGenerator: (req) => {
        // When trust proxy is enabled, Express automatically uses X-Forwarded-For to set req.ip
        return req.ip || req.socket.remoteAddress || 'unknown';
    },
    validate: {
        trustProxy: true, // Trust proxy headers
    },
});

app.use(limiter);
app.use(express.json({ limit: "10mb" })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to Database
connectDB();

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Homestay Backend API is running",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/payment", paymentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});