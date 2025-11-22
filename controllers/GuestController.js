import Guest from "../models/Guest.js";
import { validationResult } from "express-validator";

// Create Guest (POST) - Admin only
export const createGuest = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { fullName, email, phone, address, visitDate, accommodationType, notes } = req.body;

        // Validate visit date is not in the past
        const visit = new Date(visitDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (visit < today) {
            return res.status(400).json({
                success: false,
                message: "Visit date cannot be in the past",
            });
        }

        // Create new guest
        const guest = await Guest.create({
            fullName,
            email: email.toLowerCase(),
            phone,
            address: address || "",
            visitDate: visit,
            accommodationType,
            notes: notes || "",
            createdBy: req.admin.id,
        });

        res.status(201).json({
            success: true,
            message: "Guest created successfully",
            data: {
                guest: {
                    id: guest._id,
                    fullName: guest.fullName,
                    email: guest.email,
                    phone: guest.phone,
                    address: guest.address,
                    visitDate: guest.visitDate,
                    accommodationType: guest.accommodationType,
                    status: guest.status,
                    notes: guest.notes,
                    createdAt: guest.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Create guest error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Guest with this email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error creating guest",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get All Guests (GET) - Admin only
export const getGuests = async (req, res) => {
    try {
        const { status, accommodationType, email, page = 1, limit = 10, sort = "-visitDate" } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (accommodationType) filter.accommodationType = accommodationType;
        if (email) filter.email = email.toLowerCase();

        // Filter by date range if provided
        if (req.query.startDate || req.query.endDate) {
            filter.visitDate = {};
            if (req.query.startDate) {
                filter.visitDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.visitDate.$lte = new Date(req.query.endDate);
            }
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get guests with pagination
        const guests = await Guest.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v")
            .populate("createdBy", "name email");

        // Get total count for pagination
        const total = await Guest.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Guests retrieved successfully",
            data: {
                guests,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Get guests error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving guests",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Single Guest (GET) - Admin only
export const getGuestById = async (req, res) => {
    try {
        const { id } = req.params;

        const guest = await Guest.findById(id)
            .select("-__v")
            .populate("createdBy", "name email");

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Guest retrieved successfully",
            data: {
                guest,
            },
        });
    } catch (error) {
        console.error("Get guest error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid guest ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving guest",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Update Guest (PUT) - Admin only
export const updateGuest = async (req, res) => {
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
        const { fullName, email, phone, address, visitDate, accommodationType, status, notes } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email.toLowerCase();
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (visitDate !== undefined) {
            const visit = new Date(visitDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (visit < today) {
                return res.status(400).json({
                    success: false,
                    message: "Visit date cannot be in the past",
                });
            }
            updateData.visitDate = visit;
        }
        if (accommodationType !== undefined) updateData.accommodationType = accommodationType;
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const guest = await Guest.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-__v")
        .populate("createdBy", "name email");

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Guest updated successfully",
            data: {
                guest,
            },
        });
    } catch (error) {
        console.error("Update guest error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid guest ID",
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Guest with this email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating guest",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Delete Guest (DELETE) - Admin only
export const deleteGuest = async (req, res) => {
    try {
        const { id } = req.params;

        const guest = await Guest.findByIdAndDelete(id);

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Guest deleted successfully",
            data: {
                id: guest._id,
                fullName: guest.fullName,
                email: guest.email,
            },
        });
    } catch (error) {
        console.error("Delete guest error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid guest ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting guest",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Guests Statistics - Admin only
export const getGuestStatistics = async (req, res) => {
    try {
        const totalGuests = await Guest.countDocuments();
        const activeGuests = await Guest.countDocuments({ status: "active" });
        const completedGuests = await Guest.countDocuments({ status: "completed" });

        // Count by accommodation type
        const accommodationStats = await Guest.aggregate([
            {
                $group: {
                    _id: "$accommodationType",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Count by status
        const statusStats = await Guest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Guest statistics retrieved successfully",
            data: {
                total: totalGuests,
                active: activeGuests,
                completed: completedGuests,
                byAccommodationType: accommodationStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byStatus: statusStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
            },
        });
    } catch (error) {
        console.error("Get guest statistics error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving guest statistics",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

