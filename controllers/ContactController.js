import Contact from "../models/Contact.js";
import { validationResult } from "express-validator";
import {
    sendContactConfirmationEmail,
    sendAdminNotificationEmail,
} from "../utils/emailService.js";

// Create Contact (POST)
export const createContact = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { fullName, email, subject, message } = req.body;

        // Create new contact
        const contact = await Contact.create({
            fullName,
            email,
            subject,
            message,
        });

        // Send confirmation email to user
        const emailResult = await sendContactConfirmationEmail({
            fullName: contact.fullName,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            createdAt: contact.createdAt,
        });

        // Update contact with email sent status
        if (emailResult.success) {
            contact.emailSent = true;
            await contact.save({ validateBeforeSave: false });
        }

        // Send notification email to admin (optional, non-blocking)
        if (process.env.ADMIN_EMAIL) {
            sendAdminNotificationEmail({
                fullName: contact.fullName,
                email: contact.email,
                subject: contact.subject,
                message: contact.message,
                createdAt: contact.createdAt,
            }).catch((error) => {
                console.error("Failed to send admin notification:", error);
            });
        }

        res.status(201).json({
            success: true,
            message: "Contact created successfully. Confirmation email sent.",
            data: {
                contact: {
                    id: contact._id,
                    fullName: contact.fullName,
                    email: contact.email,
                    subject: contact.subject,
                    message: contact.message,
                    status: contact.status,
                    emailSent: contact.emailSent,
                    createdAt: contact.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Create contact error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating contact",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get All Contacts (GET)
export const getContacts = async (req, res) => {
    try {
        const { status, isRead, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (isRead !== undefined) filter.isRead = isRead === "true";

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get contacts with pagination
        const contacts = await Contact.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select("-__v");

        // Get total count for pagination
        const total = await Contact.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Contacts retrieved successfully",
            data: {
                contacts,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving contacts",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Get Single Contact (GET)
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id).select("-__v");

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact retrieved successfully",
            data: {
                contact,
            },
        });
    } catch (error) {
        console.error("Get contact error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error retrieving contact",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Update Contact (PUT)
export const updateContact = async (req, res) => {
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
        const { fullName, email, subject, message, status, isRead } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email;
        if (subject !== undefined) updateData.subject = subject;
        if (message !== undefined) updateData.message = message;
        if (status !== undefined) updateData.status = status;
        if (isRead !== undefined) updateData.isRead = isRead;

        const contact = await Contact.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-__v");

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: {
                contact,
            },
        });
    } catch (error) {
        console.error("Update contact error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating contact",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Delete Contact (DELETE)
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully",
            data: {
                id: contact._id,
            },
        });
    } catch (error) {
        console.error("Delete contact error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error deleting contact",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

// Mark Contact as Read (PATCH)
export const markContactAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndUpdate(
            id,
            { isRead: true, status: "read" },
            { new: true }
        ).select("-__v");

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact marked as read",
            data: {
                contact,
            },
        });
    } catch (error) {
        console.error("Mark contact as read error:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error marking contact as read",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

