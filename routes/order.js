
// // finallll:
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Admin = require('../models/admin');
const { logger } = require("../utils/logger");
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendOrderEmail = async (toEmail, orderData) => {
    const recipients = [toEmail];

    // Also send to company email if it's different from user email
    if (toEmail !== process.env.EMAIL_USERNAME) {
        recipients.push(process.env.EMAIL_USERNAME);
    }

    const { items, totalAmount, _id: orderId, address, phone, createdAt } = orderData;

    // Format date
    const orderDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate subtotal and format items
    const itemsHTML = items.map((item, index) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px 10px; vertical-align: top;">
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${item.name}</div>
                <div style="font-size: 13px; color: #666;">Quantity: ${item.quantity}</div>
            </td>
            <td style="padding: 15px 10px; text-align: right; vertical-align: top; font-weight: 600; color: #333;">
                ₹${item.price.toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
        to: recipients.join(', '),
        subject: `Order Confirmed - #${orderId}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Chauhan Sons Jewellers</h1>
                            <p style="margin: 8px 0 0 0; color: #f0d4b0; font-size: 14px; letter-spacing: 1px;">FINE JEWELRY SINCE 1969</p>
                        </td>
                    </tr>

                    <!-- Success Message -->
                    <tr>
                        <td style="padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #7d2a25;">
                            <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 20px;">
                                <span style="color: #2e7d32; font-size: 32px;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
                            <p style="margin: 0; color: #666; font-size: 15px;">Thank you for your purchase. Your order has been received and is being processed.</p>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
                                            <tr>
                                                <td style="width: 50%; padding: 10px;">
                                                    <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Number</div>
                                                    <div style="font-size: 16px; color: #333; font-weight: 600;">#${orderId}</div>
                                                </td>
                                                <td style="width: 50%; padding: 10px; text-align: right;">
                                                    <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Date</div>
                                                    <div style="font-size: 16px; color: #333; font-weight: 600;">${orderDate}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Order Items -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f9f9f9;">
                                        <th style="padding: 15px 10px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Item</th>
                                        <th style="padding: 15px 10px; text-align: right; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                            </table>

                            <!-- Order Summary -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                                <tr>
                                    <td style="padding: 15px 0; border-top: 2px solid #eee;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0; color: #666; font-size: 15px;">Subtotal</td>
                                                <td style="padding: 8px 0; text-align: right; color: #333; font-size: 15px; font-weight: 500;">₹${totalAmount.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666; font-size: 15px;">Shipping</td>
                                                <td style="padding: 8px 0; text-align: right; color: #2e7d32; font-size: 15px; font-weight: 600;">FREE</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px 0 0 0; color: #333; font-size: 18px; font-weight: 700; border-top: 2px solid #7d2a25;">Order Total</td>
                                                <td style="padding: 15px 0 0 0; text-align: right; color: #7d2a25; font-size: 20px; font-weight: 700; border-top: 2px solid #7d2a25;">₹${totalAmount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Delivery Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                                <tr>
                                    <td>
                                        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #7d2a25;">
                                            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Delivery Address</h3>
                                            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.6;">${address}</p>
                                            <p style="margin: 0; color: #666; font-size: 14px;">
                                                <strong style="color: #333;">Contact:</strong> ${phone}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- What's Next -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">What happens next?</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; vertical-align: top; width: 30px;">
                                                    <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</div>
                                                </td>
                                                <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
                                                    We'll send you a shipping confirmation email with tracking details
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; vertical-align: top;">
                                                    <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</div>
                                                </td>
                                                <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
                                                    Your order will be carefully packaged and shipped
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; vertical-align: top;">
                                                    <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</div>
                                                </td>
                                                <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
                                                    Enjoy your beautiful jewelry from Chauhan Sons!
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://chauhansonsjewellers.com" style="display: inline-block; background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">View Order Status</a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Need help with your order?</p>
                            <p style="margin: 0 0 15px 0;">
                                <a href="mailto:chauhansons69@yahoo.com" style="color: #7d2a25; text-decoration: none; font-weight: 600;">Contact Customer Support</a>
                            </p>
                            <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #ddd;">
                                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">Chauhan Sons Jewellers</p>
                                <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} All rights reserved</p>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    return transporter.sendMail(mailOptions);
};
// Associate guest orders with user account
router.post('/associateGuestOrders', async (req, res) => {
    const { guestEmail, userId } = req.body;

    console.log("=== ASSOCIATE GUEST ORDERS ===");
    console.log("Guest Email:", guestEmail);
    console.log("User ID:", userId);

    try {
        if (!guestEmail || !userId) {
            return res.status(400).json({
                success: false,
                message: "Email and User ID are required"
            });
        }

        // Find user by ID to get email
        const user = await Admin.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("User email from DB:", user.email);

        // Find all orders with guestEmail and either:
        // 1. userId = 'guest' OR
        // 2. userId is a guest ID (not a valid ObjectId)
        const guestOrders = await Order.find({
            userEmail: guestEmail.trim().toLowerCase(),
            $or: [
                { userId: 'guest' },
                { userId: /^guest_/ },
                { userId: { $type: 'string' } }
            ]
        });

        console.log(`Found ${guestOrders.length} guest orders to associate`);

        if (guestOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No guest orders found for this email",
                associatedCount: 0
            });
        }

        // Update each order with the actual user ID
        let updatedCount = 0;
        const updatePromises = guestOrders.map(async (order) => {
            try {
                const result = await Order.findByIdAndUpdate(
                    order._id,
                    {
                        userId: userId,
                        userEmail: user.email, // Use the email from user account (might be different case)
                        userName: user.name || order.userName // Prefer user's name from account
                    },
                    { new: true }
                );
                if (result) updatedCount++;
                return result;
            } catch (err) {
                console.error(`Failed to update order ${order._id}:`, err.message);
                return null;
            }
        });

        await Promise.all(updatePromises);

        console.log(`Successfully associated ${updatedCount} orders`);

        res.status(200).json({
            success: true,
            message: `Successfully associated ${updatedCount} guest orders with your account`,
            associatedCount: updatedCount,
            userEmail: user.email
        });

    } catch (error) {
        console.error("Error associating guest orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to associate guest orders",
            error: error.message
        });
    }
});
// Get orders by user email (for associating guest orders)
router.get('/orders/email/:email', async (req, res) => {
    const { email } = req.params;
    
    try {
        const orders = await Order.find({
            $or: [
                { userEmail: email.toLowerCase() },
                { userEmail: new RegExp(`^${email}$`, 'i') } // Case-insensitive
            ]
        })
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json({
            success: true,
            orders: orders,
            totalCount: orders.length
        });

    } catch (error) {
        console.error("Error fetching orders by email:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});
// Create Order Route - WITH AUTO CAPTURE
router.post('/createOrder', async (req, res) => {
    // CHANGE 1: Extract ALL required fields from request body
    const { userId, userEmail, userName, items, address, phone, totalAmount } = req.body;

    console.log("=== CREATE ORDER REQUEST ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("Extracted fields:", {
        userId, userEmail, userName,
        itemsCount: items?.length,
        address: address?.substring(0, 50) + "...",
        phone,
        totalAmount
    });

    try {
        // CHANGE 2: Add validation for userEmail and userName
        if (!userEmail?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        if (!userName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // Comprehensive validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items are required and must be a non-empty array"
            });
        }

        if (!address?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Address is required"
            });
        }

        if (!phone?.toString().trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid total amount is required"
            });
        }

        // CHANGE 3: Use the email and name from request body instead of fetching from database
        let user;
        if (userId && userId !== 'guest') {
            console.log("Fetching user with ID:", userId);
            try {
                user = await Admin.findById(userId);
                if (!user) {
                    console.log("User not found in DB, using provided details");
                    user = {
                        _id: userId,
                        email: userEmail,
                        name: userName
                    };
                } else {
                    console.log("User found in DB:", {
                        id: user._id,
                        email: user.email,
                        name: user.name
                    });
                }
            } catch (userError) {
                console.log("Error fetching user, using provided details:", userError.message);
                user = {
                    _id: userId,
                    email: userEmail,
                    name: userName
                };
            }
        } else {
            // For guest users or when userId is 'guest'
            console.log("Proceeding with guest order with provided details.");
            user = {
                _id: userId || 'guest',
                email: userEmail,
                name: userName
            };
        }

        // Validate items structure
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`Validating item ${i}:`, item);

            if (!item.productId || !item.name || !item.quantity || item.quantity < 1 || item.price === undefined || item.price < 0) {
                console.error(`Invalid item at index ${i}:`, item);
                return res.status(400).json({
                    success: false,
                    message: `Invalid item at index ${i}. Each item needs productId, name, quantity (≥1), and price (≥0)`
                });
            }
        }

        // Calculate and validate total
        const calculatedTotal = items.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        console.log("Amount validation:", {
            calculatedTotal,
            providedTotal: totalAmount,
            difference: Math.abs(totalAmount - calculatedTotal)
        });

        if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `Total amount mismatch. Expected: ${calculatedTotal}, Received: ${totalAmount}`
            });
        }

        // Prepare phone number
        let formattedPhone = phone.toString().trim();
        formattedPhone = formattedPhone.replace(/^\+91/, '').replace(/^91/, '');
        if (!/^\d{10}$/.test(formattedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits"
            });
        }
        formattedPhone = `+91${formattedPhone}`;

        console.log("Formatted phone:", formattedPhone);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Check Razorpay initialization
        if (!razorpayInstance || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay configuration error");
            return res.status(500).json({
                success: false,
                message: "Payment gateway configuration error. Please contact support."
            });
        }

        // Create Razorpay Order with AUTO-CAPTURE ENABLED
        console.log("Creating Razorpay order with auto-capture...");
        const amountInPaise = Math.round(totalAmount * 100);

        const razorpayOrderData = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `order_${Date.now()}_${userId ? userId.toString().slice(-6) : 'guest'}`,
            payment_capture: 1, // 🔥 CRITICAL: AUTO-CAPTURE ENABLED
            notes: {
                userId: user._id.toString(),
                phone: formattedPhone,
                itemCount: items.length.toString(),
                userEmail: user.email,
                userName: user.name
            }
        };

        console.log("Razorpay order request (WITH AUTO-CAPTURE):", JSON.stringify(razorpayOrderData, null, 2));

        let razorpayOrder;
        try {
            razorpayOrder = await razorpayInstance.orders.create(razorpayOrderData);
            console.log("Razorpay order created successfully WITH AUTO-CAPTURE:", {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                status: razorpayOrder.status,
                payment_capture: razorpayOrder.payment_capture
            });
        } catch (razorpayError) {
            console.error("=== RAZORPAY ERROR ===");
            console.error("Error:", razorpayError.message);

            let errorDetails = "Unknown error";
            if (razorpayError.error) {
                errorDetails = JSON.stringify(razorpayError.error);
            } else if (razorpayError.description) {
                errorDetails = razorpayError.description;
            } else if (razorpayError.message) {
                errorDetails = razorpayError.message;
            }

            console.error("Error details:", errorDetails);

            return res.status(500).json({
                success: false,
                message: "Failed to create payment order. Please try again.",
                error: "Payment gateway error",
                details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
            });
        }

        // Create order in database
        console.log("Creating database order...");
        const orderData = {
            userId: user._id.toString(),
            userEmail: user.email,
            userName: user.name,
            items: items.map(item => ({
                productId: item.productId.toString(),
                name: item.name.toString().trim(),
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            })),
            address: address.toString().trim(),
            phone: formattedPhone,
            totalAmount: parseFloat(totalAmount),
            razorpayOrderId: razorpayOrder.id,
            paymentInfo: {
                amount: parseFloat(totalAmount),
                status: 'created',
                razorpayOrderId: razorpayOrder.id,
                updatedAt: new Date()
            },
            status: 'Pending',
            createdAt: new Date()
        };

        console.log("Database order data:", JSON.stringify(orderData, null, 2));

        let savedOrder;
        try {
            const newOrder = new Order(orderData);
            savedOrder = await newOrder.save();
            console.log("Database order created successfully:", savedOrder._id);

            // Send order confirmation email to the email provided in request
            sendOrderEmail(user.email, savedOrder).catch(err => {
                console.error("Email sending failed:", err.message);
                if (typeof logger !== 'undefined' && logger && typeof logger.error === 'function') {
                    logger.error("Email failed:", err.message);
                }
            });

        } catch (dbError) {
            console.error("=== DATABASE ERROR ===");
            console.error("Error:", dbError.message);
            console.error("Full error:", dbError);

            if (dbError.name === 'ValidationError') {
                const validationErrors = Object.values(dbError.errors).map(e => e.message);
                console.error("Validation errors:", validationErrors);
                return res.status(400).json({
                    success: false,
                    message: "Order validation failed: " + validationErrors.join(', '),
                    razorpayOrderId: razorpayOrder.id,
                    validationErrors: validationErrors
                });
            }

            if (dbError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate order detected. Please try again.",
                    razorpayOrderId: razorpayOrder.id
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to save order. Please contact support with Razorpay Order ID: " + razorpayOrder.id,
                error: "Database error",
                details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
            });
        }

        // Log success
        if (typeof logger !== 'undefined' && logger && typeof logger.info === 'function') {
            logger.info("Order created successfully with auto-capture", {
                orderId: savedOrder._id,
                razorpayOrderId: razorpayOrder.id,
                userId,
                userEmail,
                totalAmount
            });
        }

        console.log("=== ORDER CREATION SUCCESS WITH AUTO-CAPTURE ===");

        // Send success response
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: savedOrder._id.toString(),
            razorpayOrderId: razorpayOrder.id,
            order: {
                _id: savedOrder._id.toString(),
                status: savedOrder.status,
                totalAmount: savedOrder.totalAmount,
                createdAt: savedOrder.createdAt,
                userEmail: savedOrder.userEmail,
                userName: savedOrder.userName
            }
        });

    } catch (error) {
        console.error("=== UNEXPECTED ERROR ===");
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);

        if (typeof logger !== 'undefined' && logger && typeof logger.error === 'function') {
            logger.error("Order creation failed", {
                error: error.message,
                userId,
                userEmail,
                totalAmount
            });
        }

        let errorMessage = "Failed to create order. Please try again.";
        let statusCode = 500;

        if (error.name === 'CastError') {
            errorMessage = "Invalid data format provided";
            statusCode = 400;
        } else if (error.name === 'ValidationError') {
            errorMessage = "Order data validation failed";
            statusCode = 400;
        } else if (error.code === 11000) {
            errorMessage = "Duplicate order detected";
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


// Update Order Status with AUTOMATIC REFUND
router.put('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status, cancelReason } = req.body;

    console.log("=== UPDATE ORDER STATUS ===");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);
    console.log("Cancel Reason:", cancelReason);

    if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Must be Pending, Delivered, or Cancelled"
        });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        console.log("Current order state:", {
            id: order._id,
            status: order.status,
            paymentStatus: order.paymentInfo?.status,
            paymentId: order.paymentInfo?.paymentId,
            totalAmount: order.totalAmount
        });

        let refundProcessed = false;
        let refundDetails = null;

        // 🔥 AUTOMATIC REFUND when admin cancels AND payment is captured
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            console.log("Order being cancelled - checking refund eligibility...");

            // Check if payment exists and is captured
            if (order.paymentInfo?.paymentId && order.paymentInfo?.status === 'captured') {
                console.log("✅ Payment captured - INITIATING AUTOMATIC REFUND");
                console.log("Payment ID:", order.paymentInfo.paymentId);
                console.log("Amount:", order.totalAmount);

                try {
                    // Call Razorpay refund API
                    console.log("Calling Razorpay refund API...");
                    const refund = await razorpayInstance.payments.refund(
                        order.paymentInfo.paymentId,
                        {
                            amount: Math.round(order.totalAmount * 100), // Convert to paise
                            speed: 'optimum',
                            notes: {
                                reason: cancelReason || 'Order cancelled by admin',
                                orderId: order._id.toString(),
                                cancelledBy: 'admin'
                            },
                            receipt: `refund_${order._id}_${Date.now()}`
                        }
                    );

                    console.log("✅ REFUND API SUCCESS:");
                    console.log("Refund ID:", refund.id);
                    console.log("Refund Amount:", refund.amount / 100);
                    console.log("Refund Status:", refund.status);

                    // Calculate estimated settlement date
                    const estimatedSettlement = new Date();
                    estimatedSettlement.setDate(estimatedSettlement.getDate() + 5);

                    // Update order with refund information
                    order.refundInfo = {
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        status: 'initiated',
                        reason: cancelReason || 'Order cancelled by admin',
                        initiatedAt: new Date(),
                        estimatedSettlement: estimatedSettlement,
                        speed: 'optimum',
                        notes: 'Automatic refund processed on order cancellation'
                    };

                    refundProcessed = true;
                    refundDetails = order.refundInfo;

                    console.log("✅ Refund info updated in order");

                    logger.info("Refund initiated successfully", {
                        orderId: order._id,
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        paymentId: order.paymentInfo.paymentId
                    });

                } catch (refundError) {
                    console.error("❌ REFUND API FAILED:");
                    console.error("Error:", refundError.message);
                    console.error("Code:", refundError.error?.code);

                    logger.error("Refund processing failed", {
                        orderId,
                        paymentId: order.paymentInfo.paymentId,
                        error: refundError.message,
                        errorCode: refundError.error?.code
                    });

                    // Set refund as failed
                    order.refundInfo = {
                        refundId: null,
                        amount: order.totalAmount,
                        status: 'failed',
                        reason: `Refund failed: ${refundError.message}`,
                        failedAt: new Date(),
                        notes: 'Automatic refund failed - manual processing required'
                    };

                    console.log("⚠️ Refund failed but order will still be cancelled");
                }
            } else {
                console.log("ℹ️ No refund needed - payment not captured");
                console.log("Payment ID exists:", !!order.paymentInfo?.paymentId);
                console.log("Payment status:", order.paymentInfo?.status);
            }

            // Update cancellation details
            order.status = 'Cancelled';
            order.cancelReason = cancelReason || 'Cancelled by admin';
            order.cancelledBy = 'admin';
            order.cancelledAt = new Date();

        } else {
            // Regular status update
            console.log("Regular status update to:", status);
            order.status = status;
        }

        // Save the order
        await order.save();
        console.log("✅ Order saved successfully");

        const responseMessage = status === 'Cancelled'
            ? `Order cancelled successfully! ${refundProcessed
                ? `Refund of ₹${refundDetails?.amount} initiated. Refund ID: ${refundDetails?.refundId}. Settlement expected in 5-7 days.`
                : order.refundInfo?.status === 'failed'
                    ? 'Automatic refund failed - manual processing required.'
                    : 'No refund needed - payment not captured.'
            }`
            : 'Order status updated successfully';

        res.status(200).json({
            success: true,
            message: responseMessage,
            order: {
                _id: order._id,
                status: order.status,
                paymentInfo: order.paymentInfo,
                refundInfo: order.refundInfo,
                cancelReason: order.cancelReason,
                cancelledAt: order.cancelledAt
            },
            refundProcessed: refundProcessed,
            refundDetails: refundDetails
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        logger.error("Error updating order status", {
            orderId,
            error: error.message
        });

        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
});

// Get Payment Status
router.get('/paymentStatus/:orderId', async (req, res) => {
    const { orderId } = req.params;

    console.log("=== GET PAYMENT STATUS ===");
    console.log("Order ID:", orderId);

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        let latestPaymentInfo = order.paymentInfo;
        let latestRefundInfo = order.refundInfo;

        // Fetch live data from Razorpay
        if (order.razorpayOrderId) {
            try {
                const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
                const latestPayment = payments.items.length ? payments.items[0] : null;

                if (latestPayment) {
                    latestPaymentInfo = {
                        paymentId: latestPayment.id,
                        amount: latestPayment.amount / 100,
                        status: latestPayment.status,
                        method: latestPayment.method,
                        capturedAt: latestPayment.captured_at ? new Date(latestPayment.captured_at * 1000) : null,
                        failedAt: latestPayment.failed_at ? new Date(latestPayment.failed_at * 1000) : null,
                        updatedAt: new Date()
                    };

                    // Fetch refunds if payment is captured
                    if (latestPayment.status === 'captured') {
                        try {
                            const refunds = await razorpayInstance.payments.fetchMultipleRefund(latestPayment.id);

                            if (refunds.items.length > 0) {
                                const latestRefund = refunds.items[0];
                                const estimatedSettlement = new Date(latestRefund.created_at * 1000);
                                estimatedSettlement.setDate(estimatedSettlement.getDate() + 5);

                                latestRefundInfo = {
                                    refundId: latestRefund.id,
                                    amount: latestRefund.amount / 100,
                                    status: latestRefund.status === 'processed' ? 'processed' : 'initiated',
                                    reason: latestRefund.notes?.reason || order.cancelReason || 'Refund processed',
                                    initiatedAt: new Date(latestRefund.created_at * 1000),
                                    processedAt: latestRefund.processed_at ? new Date(latestRefund.processed_at * 1000) : null,
                                    estimatedSettlement: estimatedSettlement,
                                    speed: 'optimum',
                                    notes: 'Refund from order cancellation'
                                };
                            } else if (order.status === 'Cancelled' && !order.refundInfo?.refundId) {
                                latestRefundInfo = {
                                    refundId: null,
                                    amount: 0,
                                    status: 'none',
                                    reason: null,
                                    initiatedAt: null,
                                    processedAt: null,
                                    estimatedSettlement: null,
                                    speed: null,
                                    notes: null
                                };
                            }
                        } catch (refundError) {
                            console.log('No refunds found for payment:', latestPayment.id);
                        }
                    }

                    // Update order with latest info
                    await Order.findByIdAndUpdate(orderId, {
                        paymentInfo: latestPaymentInfo,
                        refundInfo: latestRefundInfo
                    });
                }
            } catch (razorpayError) {
                console.error("Error fetching from Razorpay:", razorpayError.message);
            }
        }

        res.status(200).json({
            success: true,
            paymentInfo: latestPaymentInfo,
            refundInfo: latestRefundInfo,
            order: {
                _id: order._id,
                status: order.status,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                userEmail: order.userEmail
            }
        });

    } catch (error) {
        console.error("Error fetching payment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment status",
            error: error.message
        });
    }
});

// Get Orders by User ID
router.get('/orders/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                select: 'name images price', // Add any other fields you need
                model: 'Product'
            })
            .lean();

        res.status(200).json({
            success: true,
            orders: orders,
            totalCount: orders.length
        });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});
// Get All Orders (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.productId',
        select: 'name consumer_price media',
        strictPopulate: false,     // <-- THIS PREVENTS CRASH
      })
      .lean();

    res.status(200).json({
      success: true,
      orders,
      totalCount: orders.length
    });

  } catch (error) {
    console.error("ORDERS FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});



// Get refund status for specific order
router.get('/orders/:orderId/refund-status', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        let refundInfo = order.refundInfo || { status: 'none' };

        // Fetch latest status from Razorpay if refund exists
        if (order.refundInfo?.refundId && order.paymentInfo?.paymentId) {
            try {
                const refunds = await razorpayInstance.payments.fetchMultipleRefund(order.paymentInfo.paymentId);
                const latestRefund = refunds.items.find(r => r.id === order.refundInfo.refundId);

                if (latestRefund) {
                    const estimatedSettlement = new Date(latestRefund.created_at * 1000);
                    estimatedSettlement.setDate(estimatedSettlement.getDate() + 5);

                    refundInfo = {
                        refundId: latestRefund.id,
                        amount: latestRefund.amount / 100,
                        status: latestRefund.status === 'processed' ? 'processed' : 'initiated',
                        reason: order.refundInfo.reason || 'Refund processed',
                        initiatedAt: new Date(latestRefund.created_at * 1000),
                        processedAt: latestRefund.processed_at ? new Date(latestRefund.processed_at * 1000) : null,
                        estimatedSettlement: estimatedSettlement,
                        speed: 'optimum',
                        notes: order.refundInfo.notes
                    };

                    // Update in database
                    await Order.findByIdAndUpdate(orderId, { refundInfo });
                }
            } catch (error) {
                console.log('Error fetching refund status:', error.message);
            }
        }

        res.status(200).json({
            success: true,
            refundInfo: refundInfo
        });

    } catch (error) {
        console.error("Error fetching refund status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch refund status",
            error: error.message
        });
    }
});

module.exports = router;
