import express from "express";
import {
    createBooking,
    getBookings,
    getBookingById,
    getBookingByReference,
    updateBooking,
    deleteBooking,
    confirmBooking,
    cancelBooking,
} from "../controllers/BookingController.js";
import { protect } from "../middleware/auth.js";
import {
    validateBooking,
    validateBookingUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.post("/", validateBooking, createBooking);
router.get("/reference/:reference", getBookingByReference); // Public endpoint for booking lookup by reference

// Protected routes - Admin only
router.get("/", protect, getBookings);
router.get("/:id", getBookingById); // Can be accessed with email query param for public lookup
router.put("/:id", protect, validateBookingUpdate, updateBooking);
router.delete("/:id", protect, deleteBooking);
router.patch("/:id/confirm", protect, confirmBooking);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;

