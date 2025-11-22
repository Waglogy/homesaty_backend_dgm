import Booking from "../models/Booking.js";
import { validationResult } from "express-validator";
import {
    sendBookingReceivedEmail,
    sendBookingConfirmationEmail,
    sendAdminBookingNotificationEmail,
} from "../utils/emailService.js";

// Create Booking (POST)
export const createBooking = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { fullName, email, phoneNumber, checkInDate, checkOutDate, numberOfGuests, accommodationType, specialRequests } = req.body;

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            return res.status(400).json({
                success: false,
                message: "Check-in date cannot be in the past",
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date",
            });
        }

        // Accommodation prices
        const priceMap = {
            "Luxury Glamping Tent": 6500,
            "Authentic Homestay": 3500,
            "Mountain Wellness Pod": 5000,
        };

        const accommodationPrice = priceMap[accommodationType] || 0;

        // Calculate number of nights
        const diffTime = Math.abs(checkOut - checkIn);
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate total amount
        const totalAmount = accommodationPrice * numberOfNights;

        // Create new booking
        const booking = await Booking.create({
            fullName,
            email,
            phoneNumber,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests,
            accommodationType,
            accommodationPrice,
            specialRequests: specialRequests || "",
            numberOfNights,
            totalAmount,
            status: "pending",
        });

        // Send "booking received" email to user
        const emailResult = await sendBookingReceivedEmail({
            fullName: booking.fullName,
            email: booking.email,
            phoneNumber: booking.phoneNumber,
            bookingReference: booking.bookingReference,
            accommodationType: booking.accommodationType,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            numberOfNights: booking.numberOfNights,
            numberOfGuests: booking.numberOfGuests,
            accommodationPrice: booking.accommodationPrice,
            totalAmount: booking.totalAmount,
            specialRequests: booking.specialRequests,
            status: booking.status,
            createdAt: booking.createdAt,
        });

        // Update booking with email sent status
        if (emailResult.success) {
            booking.emailSent = true;
            await booking.save({ validateBeforeSave: false });
        }

        // Send notification email to admin (optional, non-blocking)
        if (process.env.ADMIN_EMAIL) {
            sendAdminBookingNotificationEmail({
                fullName: booking.fullName,
                email: booking.email,
                phoneNumber: booking.phoneNumber,
                bookingReference: booking.bookingReference,
                accommodationType: booking.accommodationType,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                numberOfNights: booking.numberOfNights,
                numberOfGuests: booking.numberOfGuests,
                totalAmount: booking.totalAmount,
                specialRequests: booking.specialRequests,
                status: booking.status,
                createdAt: booking.createdAt,
            }).catch((error) => {
                console.error("Failed to send admin notification:", error);
            });
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully. Booking received email sent. Confirmation will be sent shortly.",
            data: {
                booking: {
                    id: booking._id,
                    bookingReference: booking.bookingReference,
                    fullName: booking.fullName,
                    email: booking.email,
                    phoneNumber: booking.phoneNumber,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    numberOfNights: booking.numberOfNights,
                    numberOfGuests: booking.numberOfGuests,
                    accommodationType: booking.accommodationType,
                    accommodationPrice: booking.accommodationPrice,
                    totalAmount: booking.totalAmount,
                    specialRequests: booking.specialRequests,
                    status: booking.status,
                    emailSent: booking.emailSent,
                    createdAt: booking.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get All Bookings (GET)
export const getBookings = async (req, res) => {
    try {
        const { status, email, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (email) filter.email = email.toLowerCase();

        // For public access (non-admin), only show their own bookings by email
        if (!req.admin && email) {
            filter.email = email.toLowerCase();
        } else if (!req.admin) {
            return res.status(403).json({
                success: false,
                message: "Authentication required or email parameter needed",
            });
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get bookings with pagination
        const bookings = await Booking.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v");

        // Get total count for pagination
        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: {
                bookings,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Get bookings error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving bookings",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Single Booking (GET)
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id).select("-__v");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // For public access (non-admin), verify email matches
        if (!req.admin && req.query.email && booking.email.toLowerCase() !== req.query.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            data: {
                booking,
            },
        });
    } catch (error) {
        console.error("Get booking error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Booking by Reference (GET)
export const getBookingByReference = async (req, res) => {
    try {
        const { reference } = req.params;

        const booking = await Booking.findOne({ bookingReference: reference.toUpperCase() }).select("-__v");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // For public access (non-admin), verify email matches if provided
        if (!req.admin && req.query.email && booking.email.toLowerCase() !== req.query.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            data: {
                booking,
            },
        });
    } catch (error) {
        console.error("Get booking by reference error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Update Booking (PUT)
export const updateBooking = async (req, res) => {
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
        const { fullName, email, phoneNumber, checkInDate, checkOutDate, numberOfGuests, accommodationType, specialRequests, status } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Build update data
        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email.toLowerCase();
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (checkInDate !== undefined) updateData.checkInDate = new Date(checkInDate);
        if (checkOutDate !== undefined) updateData.checkOutDate = new Date(checkOutDate);
        if (numberOfGuests !== undefined) updateData.numberOfGuests = numberOfGuests;
        if (accommodationType !== undefined) {
            updateData.accommodationType = accommodationType;
            const priceMap = {
                "Luxury Glamping Tent": 6500,
                "Authentic Homestay": 3500,
                "Mountain Wellness Pod": 5000,
            };
            updateData.accommodationPrice = priceMap[accommodationType] || booking.accommodationPrice;
        }
        if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
        if (status !== undefined) updateData.status = status;

        // Recalculate dates if they changed
        const finalCheckIn = updateData.checkInDate || booking.checkInDate;
        const finalCheckOut = updateData.checkOutDate || booking.checkOutDate;

        if (updateData.checkInDate || updateData.checkOutDate) {
            const diffTime = Math.abs(finalCheckOut - finalCheckIn);
            updateData.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            updateData.totalAmount = (updateData.accommodationPrice || booking.accommodationPrice) * updateData.numberOfNights;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-__v");

        // Send confirmation email if status changed to "confirmed"
        if (status === "confirmed" && booking.status !== "confirmed") {
            sendBookingConfirmationEmail({
                fullName: updatedBooking.fullName,
                email: updatedBooking.email,
                phoneNumber: updatedBooking.phoneNumber,
                bookingReference: updatedBooking.bookingReference,
                accommodationType: updatedBooking.accommodationType,
                checkInDate: updatedBooking.checkInDate,
                checkOutDate: updatedBooking.checkOutDate,
                numberOfNights: updatedBooking.numberOfNights,
                numberOfGuests: updatedBooking.numberOfGuests,
                accommodationPrice: updatedBooking.accommodationPrice,
                totalAmount: updatedBooking.totalAmount,
                specialRequests: updatedBooking.specialRequests,
                status: updatedBooking.status,
                createdAt: updatedBooking.createdAt,
            }).catch((error) => {
                console.error("Failed to send confirmation email:", error);
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking updated successfully" + (status === "confirmed" && booking.status !== "confirmed" ? ". Confirmation email sent." : ""),
            data: {
                booking: updatedBooking,
            },
        });
    } catch (error) {
        console.error("Update booking error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Delete Booking (DELETE)
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            data: {
                id: booking._id,
                bookingReference: booking.bookingReference,
            },
        });
    } catch (error) {
        console.error("Delete booking error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Confirm Booking (PATCH)
export const confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const oldBooking = await Booking.findById(id);
        
        if (!oldBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status: "confirmed" },
            { new: true }
        ).select("-__v");

        // Send confirmation email to user
        const emailResult = await sendBookingConfirmationEmail({
            fullName: booking.fullName,
            email: booking.email,
            phoneNumber: booking.phoneNumber,
            bookingReference: booking.bookingReference,
            accommodationType: booking.accommodationType,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            numberOfNights: booking.numberOfNights,
            numberOfGuests: booking.numberOfGuests,
            accommodationPrice: booking.accommodationPrice,
            totalAmount: booking.totalAmount,
            specialRequests: booking.specialRequests,
            status: booking.status,
            createdAt: booking.createdAt,
        });

        // Update email sent status
        if (emailResult.success) {
            booking.emailSent = true;
            await booking.save({ validateBeforeSave: false });
        }

        res.status(200).json({
            success: true,
            message: "Booking confirmed successfully. Confirmation email sent.",
            data: {
                booking,
            },
        });
    } catch (error) {
        console.error("Confirm booking error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error confirming booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Cancel Booking (PATCH)
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status: "cancelled" },
            { new: true }
        ).select("-__v");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: {
                booking,
            },
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error cancelling booking",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

