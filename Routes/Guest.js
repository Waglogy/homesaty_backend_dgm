import express from "express";
import {
    createGuest,
    getGuests,
    getGuestById,
    updateGuest,
    deleteGuest,
    getGuestStatistics,
} from "../controllers/GuestController.js";
import { protect } from "../middleware/auth.js";
import {
    validateGuest,
    validateGuestUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// All routes are protected (admin only)
router.use(protect);

// Guest CRUD routes
router.post("/", validateGuest, createGuest);
router.get("/", getGuests);
router.get("/statistics", getGuestStatistics);
router.get("/:id", getGuestById);
router.put("/:id", validateGuestUpdate, updateGuest);
router.delete("/:id", deleteGuest);

export default router;

