import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { validationResult } from "express-validator";

// Create Payment (POST) - Admin only
export const createPayment = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { bookingId, guestName, amount, paymentDate, paymentMethod, referenceTransactionId, description, status } = req.body;

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Create new payment
        const payment = await Payment.create({
            bookingId,
            guestName,
            amount,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            paymentMethod,
            referenceTransactionId: referenceTransactionId || "",
            description: description || "",
            status: status || "completed",
            createdBy: req.admin.id,
        });

        // Populate booking reference
        await payment.populate("bookingId", "bookingReference fullName email totalAmount");

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: {
                payment: {
                    id: payment._id,
                    bookingId: payment.bookingId._id,
                    bookingReference: payment.bookingId.bookingReference,
                    guestName: payment.guestName,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    paymentMethod: payment.paymentMethod,
                    referenceTransactionId: payment.referenceTransactionId,
                    description: payment.description,
                    status: payment.status,
                    createdAt: payment.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Create payment error:", error);
        res.status(500).json({
            success: false,
            message: "Error recording payment",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get All Payments (GET) - Admin only
export const getPayments = async (req, res) => {
    try {
        const { bookingId, paymentMethod, status, startDate, endDate, page = 1, limit = 10, sort = "-paymentDate" } = req.query;

        // Build filter
        const filter = {};
        if (bookingId) filter.bookingId = bookingId;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (status) filter.status = status;

        // Filter by date range if provided
        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) {
                filter.paymentDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.paymentDate.$lte = new Date(endDate);
            }
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get payments with pagination
        const payments = await Payment.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v")
            .populate("bookingId", "bookingReference fullName email totalAmount")
            .populate("createdBy", "name email");

        // Get total count for pagination
        const total = await Payment.countDocuments(filter);

        // Calculate total amount
        const totalAmount = await Payment.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            success: true,
            message: "Payments retrieved successfully",
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
                totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
            },
        });
    } catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving payments",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Single Payment (GET) - Admin only
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id)
            .select("-__v")
            .populate("bookingId", "bookingReference fullName email totalAmount checkInDate checkOutDate")
            .populate("createdBy", "name email");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment retrieved successfully",
            data: {
                payment,
            },
        });
    } catch (error) {
        console.error("Get payment error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving payment",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Payments by Booking ID (GET) - Admin only
export const getPaymentsByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const payments = await Payment.find({ bookingId })
            .sort("-paymentDate")
            .select("-__v")
            .populate("createdBy", "name email");

        // Calculate total paid amount
        const totalPaid = await Payment.aggregate([
            { $match: { bookingId: booking._id, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalPaidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
        const remainingAmount = booking.totalAmount - totalPaidAmount;

        res.status(200).json({
            success: true,
            message: "Payments retrieved successfully",
            data: {
                booking: {
                    id: booking._id,
                    bookingReference: booking.bookingReference,
                    totalAmount: booking.totalAmount,
                    totalPaid: totalPaidAmount,
                    remainingAmount: remainingAmount,
                },
                payments,
            },
        });
    } catch (error) {
        console.error("Get payments by booking ID error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving payments",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Update Payment (PUT) - Admin only
export const updatePayment = async (req, res) => {
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
        const { bookingId, guestName, amount, paymentDate, paymentMethod, referenceTransactionId, description, status } = req.body;

        const updateData = {};
        if (bookingId !== undefined) {
            // Verify booking exists if bookingId is being updated
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }
            updateData.bookingId = bookingId;
        }
        if (guestName !== undefined) updateData.guestName = guestName;
        if (amount !== undefined) updateData.amount = amount;
        if (paymentDate !== undefined) updateData.paymentDate = new Date(paymentDate);
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (referenceTransactionId !== undefined) updateData.referenceTransactionId = referenceTransactionId;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

        const payment = await Payment.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        )
            .select("-__v")
            .populate("bookingId", "bookingReference fullName email totalAmount")
            .populate("createdBy", "name email");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            data: {
                payment,
            },
        });
    } catch (error) {
        console.error("Update payment error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating payment",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Delete Payment (DELETE) - Admin only
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findByIdAndDelete(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully",
            data: {
                id: payment._id,
                bookingId: payment.bookingId,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
            },
        });
    } catch (error) {
        console.error("Delete payment error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting payment",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Payment Statistics - Admin only
export const getPaymentStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.paymentDate = {};
            if (startDate) {
                dateFilter.paymentDate.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.paymentDate.$lte = new Date(endDate);
            }
        }

        // Total payments and amount
        const totalPayments = await Payment.countDocuments(dateFilter);
        const totalAmount = await Payment.aggregate([
            { $match: { ...dateFilter, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Count by payment method
        const paymentMethodStats = await Payment.aggregate([
            { $match: { ...dateFilter, status: "completed" } },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // Count by status
        const statusStats = await Payment.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // Monthly breakdown (last 12 months)
        const monthlyStats = await Payment.aggregate([
            { $match: { ...dateFilter, status: "completed" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
        ]);

        res.status(200).json({
            success: true,
            message: "Payment statistics retrieved successfully",
            data: {
                total: totalPayments,
                totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
                byPaymentMethod: paymentMethodStats.reduce((acc, item) => {
                    acc[item._id] = {
                        count: item.count,
                        totalAmount: item.totalAmount
                    };
                    return acc;
                }, {}),
                byStatus: statusStats.reduce((acc, item) => {
                    acc[item._id] = {
                        count: item.count,
                        totalAmount: item.totalAmount
                    };
                    return acc;
                }, {}),
                monthlyBreakdown: monthlyStats.map(item => ({
                    year: item._id.year,
                    month: item._id.month,
                    count: item.count,
                    totalAmount: item.totalAmount
                })),
            },
        });
    } catch (error) {
        console.error("Get payment statistics error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving payment statistics",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

