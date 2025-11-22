import express from "express";
import {
    createPayment,
    getPayments,
    getPaymentById,
    getPaymentsByBookingId,
    updatePayment,
    deletePayment,
    getPaymentStatistics,
} from "../controllers/PaymentController.js";
import { protect } from "../middleware/auth.js";
import {
    validatePayment,
    validatePaymentUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// All routes are protected (admin only)
router.use(protect);

// Payment CRUD routes
router.post("/", validatePayment, createPayment);
router.get("/", getPayments);
router.get("/statistics", getPaymentStatistics);
router.get("/booking/:bookingId", getPaymentsByBookingId);
router.get("/:id", getPaymentById);
router.put("/:id", validatePaymentUpdate, updatePayment);
router.delete("/:id", deletePayment);

export default router;

