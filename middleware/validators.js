import { body, validationResult } from "express-validator";

// Validation rules for admin registration
export const validateAdminRegistration = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

// Validation rules for admin login
export const validateAdminLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

// Validation rules for contact creation
export const validateContact = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required")
        .isLength({ min: 5, max: 200 })
        .withMessage("Subject must be between 5 and 200 characters"),
    
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Message must be between 10 and 2000 characters"),
];

// Validation rules for contact update (all fields optional)
export const validateContactUpdate = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Email address cannot be empty")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("subject")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Subject cannot be empty")
        .isLength({ min: 5, max: 200 })
        .withMessage("Subject must be between 5 and 200 characters"),
    
    body("message")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Message cannot be empty")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Message must be between 10 and 2000 characters"),
    
    body("status")
        .optional()
        .isIn(["new", "read", "replied", "closed"])
        .withMessage("Status must be one of: new, read, replied, closed"),
    
    body("isRead")
        .optional()
        .isBoolean()
        .withMessage("isRead must be a boolean value"),
];

// Validation rules for review creation
export const validateReview = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("location")
        .trim()
        .notEmpty()
        .withMessage("Location is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Location must be between 2 and 100 characters"),
    
    body("review")
        .trim()
        .notEmpty()
        .withMessage("Review is required")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Review must be between 10 and 2000 characters"),
    
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),
];

// Validation rules for review update (all fields optional)
export const validateReviewUpdate = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Email address cannot be empty")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("location")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Location cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Location must be between 2 and 100 characters"),
    
    body("review")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Review cannot be empty")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Review must be between 10 and 2000 characters"),
    
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),
    
    body("status")
        .optional()
        .isIn(["pending", "approved", "rejected"])
        .withMessage("Status must be one of: pending, approved, rejected"),
    
    body("isApproved")
        .optional()
        .isBoolean()
        .withMessage("isApproved must be a boolean value"),
];

// Validation rules for booking creation
export const validateBooking = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("phoneNumber")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage("Please provide a valid phone number"),
    
    body("checkInDate")
        .notEmpty()
        .withMessage("Check-in date is required")
        .isISO8601()
        .withMessage("Check-in date must be a valid date")
        .custom((value) => {
            const checkIn = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (checkIn < today) {
                throw new Error("Check-in date cannot be in the past");
            }
            return true;
        }),
    
    body("checkOutDate")
        .notEmpty()
        .withMessage("Check-out date is required")
        .isISO8601()
        .withMessage("Check-out date must be a valid date")
        .custom((value, { req }) => {
            const checkOut = new Date(value);
            const checkIn = new Date(req.body.checkInDate);
            if (checkOut <= checkIn) {
                throw new Error("Check-out date must be after check-in date");
            }
            return true;
        }),
    
    body("numberOfGuests")
        .notEmpty()
        .withMessage("Number of guests is required")
        .isInt({ min: 1, max: 10 })
        .withMessage("Number of guests must be between 1 and 10"),
    
    body("accommodationType")
        .trim()
        .notEmpty()
        .withMessage("Accommodation type is required")
        .isIn(["Luxury Glamping Tent", "Authentic Homestay", "Mountain Wellness Pod"])
        .withMessage("Accommodation type must be one of: Luxury Glamping Tent, Authentic Homestay, Mountain Wellness Pod"),
    
    body("specialRequests")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Special requests cannot exceed 1000 characters"),
];

// Validation rules for booking update (all fields optional)
export const validateBookingUpdate = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Email address cannot be empty")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("phoneNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Phone number cannot be empty")
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage("Please provide a valid phone number"),
    
    body("checkInDate")
        .optional()
        .isISO8601()
        .withMessage("Check-in date must be a valid date"),
    
    body("checkOutDate")
        .optional()
        .isISO8601()
        .withMessage("Check-out date must be a valid date"),
    
    body("numberOfGuests")
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage("Number of guests must be between 1 and 10"),
    
    body("accommodationType")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Accommodation type cannot be empty")
        .isIn(["Luxury Glamping Tent", "Authentic Homestay", "Mountain Wellness Pod"])
        .withMessage("Accommodation type must be one of: Luxury Glamping Tent, Authentic Homestay, Mountain Wellness Pod"),
    
    body("specialRequests")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Special requests cannot exceed 1000 characters"),
    
    body("status")
        .optional()
        .isIn(["pending", "confirmed", "cancelled", "completed"])
        .withMessage("Status must be one of: pending, confirmed, cancelled, completed"),
];

// Validation rules for guest creation (Admin only)
export const validateGuest = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage("Please provide a valid phone number"),
    
    body("address")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Address cannot exceed 500 characters"),
    
    body("visitDate")
        .notEmpty()
        .withMessage("Visit date is required")
        .isISO8601()
        .withMessage("Visit date must be a valid date"),
    
    body("accommodationType")
        .trim()
        .notEmpty()
        .withMessage("Accommodation type is required")
        .isIn(["Luxury Glamping Tent", "Authentic Homestay", "Mountain Wellness Pod"])
        .withMessage("Accommodation type must be one of: Luxury Glamping Tent, Authentic Homestay, Mountain Wellness Pod"),
    
    body("notes")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters"),
];

// Validation rules for guest update (all fields optional)
export const validateGuestUpdate = [
    body("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    
    body("email")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Email cannot be empty")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("phone")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Phone number cannot be empty")
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage("Please provide a valid phone number"),
    
    body("address")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Address cannot exceed 500 characters"),
    
    body("visitDate")
        .optional()
        .isISO8601()
        .withMessage("Visit date must be a valid date"),
    
    body("accommodationType")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Accommodation type cannot be empty")
        .isIn(["Luxury Glamping Tent", "Authentic Homestay", "Mountain Wellness Pod"])
        .withMessage("Accommodation type must be one of: Luxury Glamping Tent, Authentic Homestay, Mountain Wellness Pod"),
    
    body("status")
        .optional()
        .isIn(["active", "inactive", "completed"])
        .withMessage("Status must be one of: active, inactive, completed"),
    
    body("notes")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters"),
];

// Validation rules for payment creation (Admin only)
export const validatePayment = [
    body("bookingId")
        .notEmpty()
        .withMessage("Booking ID is required")
        .isMongoId()
        .withMessage("Booking ID must be a valid MongoDB ID"),
    
    body("guestName")
        .trim()
        .notEmpty()
        .withMessage("Guest name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Guest name must be between 2 and 100 characters"),
    
    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ min: 0.01 })
        .withMessage("Amount must be greater than 0"),
    
    body("paymentDate")
        .optional()
        .isISO8601()
        .withMessage("Payment date must be a valid date"),
    
    body("paymentMethod")
        .trim()
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(["UPI", "Credit Card", "Debit Card", "Bank Transfer", "Cash", "Other"])
        .withMessage("Payment method must be one of: UPI, Credit Card, Debit Card, Bank Transfer, Cash, Other"),
    
    body("referenceTransactionId")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Reference/Transaction ID cannot exceed 200 characters"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters"),
    
    body("status")
        .optional()
        .isIn(["pending", "completed", "failed", "refunded"])
        .withMessage("Status must be one of: pending, completed, failed, refunded"),
];

// Validation rules for payment update (all fields optional)
export const validatePaymentUpdate = [
    body("bookingId")
        .optional()
        .isMongoId()
        .withMessage("Booking ID must be a valid MongoDB ID"),
    
    body("guestName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Guest name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Guest name must be between 2 and 100 characters"),
    
    body("amount")
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage("Amount must be greater than 0"),
    
    body("paymentDate")
        .optional()
        .isISO8601()
        .withMessage("Payment date must be a valid date"),
    
    body("paymentMethod")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Payment method cannot be empty")
        .isIn(["UPI", "Credit Card", "Debit Card", "Bank Transfer", "Cash", "Other"])
        .withMessage("Payment method must be one of: UPI, Credit Card, Debit Card, Bank Transfer, Cash, Other"),
    
    body("referenceTransactionId")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Reference/Transaction ID cannot exceed 200 characters"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters"),
    
    body("status")
        .optional()
        .isIn(["pending", "completed", "failed", "refunded"])
        .withMessage("Status must be one of: pending, completed, failed, refunded"),
];

