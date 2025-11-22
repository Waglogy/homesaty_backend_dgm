import express from "express";
import {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact,
    markContactAsRead,
} from "../controllers/ContactController.js";
import { protect } from "../middleware/auth.js";
import {
    validateContact,
    validateContactUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public route - Create contact (POST)
router.post("/", validateContact, createContact);

// Protected routes - Admin only
router.get("/", protect, getContacts);
router.get("/:id", protect, getContactById);
router.put("/:id", protect, validateContactUpdate, updateContact);
router.delete("/:id", protect, deleteContact);
router.patch("/:id/read", protect, markContactAsRead);

export default router;

