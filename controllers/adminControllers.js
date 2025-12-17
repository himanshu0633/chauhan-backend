const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// OTP storage (in production, use Redis or database)
const otpStore = new Map();
const resetOtpStore = new Map();

// Email transporter setup
// In your adminControllers.js, update the transporter setup:

// Email transporter setup with better error handling
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'chauhansonsjewellers@gmail.com', // Fallback for testing
        pass: process.env.EMAIL_PASS || 'ncdw tovu pfuw bphr'     // Use App Password, not regular password
    },
    tls: {
        rejectUnauthorized: false // For development only
    }
});

// Test transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.log('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Send OTP for signup
const sendOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpStore.set(email, { otp, expiresAt });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Signup',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>OTP Verification</h2>
                <p>Your OTP for signup is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
    return otp;
};

// Send OTP for login
const sendLoginOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpStore.set(email, { otp, expiresAt });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Login',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Login OTP</h2>
                <p>Your OTP for login is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
    return otp;
};

// Send OTP for password reset
const sendResetOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    resetOtpStore.set(email, { otp, expiresAt });
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
    return otp;
};

// Check if email exists
const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email is required" });
        
        const existingAdmin = await Admin.findOne({ email });
        return res.json({ exists: !!existingAdmin });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Login with password
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.json({
            token,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Send OTP for login
const sendLoginOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Email not registered" });
        }
        
        await sendLoginOtp(email);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// Login with OTP
const loginWithOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Check if OTP exists and is valid
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }
        
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired" });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
        // OTP verified, get admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Clear OTP after successful login
        otpStore.delete(email);
        
        res.json({
            token,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Send OTP for password reset
const sendResetOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Email not registered" });
        }
        
        await sendResetOtp(email);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// Verify reset OTP
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const storedData = resetOtpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }
        
        if (Date.now() > storedData.expiresAt) {
            resetOtpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired" });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
        res.json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Reset password with OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        // Verify OTP first
        const storedData = resetOtpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }
        
        if (Date.now() > storedData.expiresAt) {
            resetOtpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired" });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
        // Update password
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        
        // Clear OTP
        resetOtpStore.delete(email);
        
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Create new admin (signup)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new admin
        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            phone
        });
        
        await newAdmin.save();
        
        res.status(201).json({
            message: "Admin created successfully",
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Read all admins
const readAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        
        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).select('-password');
        
        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Read single admin
const readAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdmin = await Admin.findByIdAndDelete(id);
        
        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get admin count
const getAdminCount = async (req, res) => {
    try {
        const count = await Admin.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
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
};