const express = require("express");
const {
    checkEmailExists,
    adminLogin,
    sendLoginOtpController,
    loginWithOtp,
    sendResetOtpController,
    verifyResetOtp,
    resetPassword,
    createAdmin,
    readAllAdmins,
    updateAdmin,
    readAdmin,
    deleteAdmin,
    getAdminCount
} = require("../controllers/adminControllers");

const tokenRequired = require("../middlewares/authMiddlewares");

const router = express.Router();

// Email verification route
router.get("/exists", checkEmailExists);

// Login routes
router.post("/login", adminLogin); // Login with password
router.post("/send-login-otp", sendLoginOtpController); // Send OTP for login
router.post("/login-with-otp", loginWithOtp); // Login with OTP

// Password reset routes
router.post("/send-reset-otp", sendResetOtpController); // Send OTP for password reset
router.post("/verify-reset-otp", verifyResetOtp); // Verify reset OTP
router.post("/reset-password", resetPassword); // Reset password with OTP

// Admin CRUD routes
router.post("/createAdmin", createAdmin);
router.get("/readallAdmins", readAllAdmins);
router.put("/updateAdmin/:id", updateAdmin);
router.get("/readAdmin/:id", readAdmin);
router.delete("/deleteAdmin/:id", deleteAdmin);
router.get("/count", getAdminCount);

module.exports = router;