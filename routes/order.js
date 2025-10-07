// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order');
// const { logger } = require("../utils/logger");

// // Create Order Route
// router.post('/createOrder', async (req, res) => {
//     const { userId, items, address, phone, totalAmount, paymentId } = req.body;

//     logger.info("Received createOrder request", { userId, itemCount: items?.length, totalAmount });

//     if (!userId || !items?.length || !address || !phone || !totalAmount) {
//         logger.warn("Missing required fields in createOrder request", { body: req.body });
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     try {
//         const newOrder = new Order({ userId, items, address, phone, totalAmount, paymentId });
//         await newOrder.save();

//         logger.info("Order created successfully", { orderId: newOrder._id, userId });

//         res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
//     } catch (error) {
//         logger.error("Error placing order", { error: error.message, stack: error.stack });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Get Orders by User ID
// router.get('/orders/:userId', async (req, res) => {
//     const { userId } = req.params;

//     logger.info("Received getOrders request", { userId });

//     try {
//         const orders = await Order.find({ userId });

//         const totalCount = orders.length;

//         logger.info("Fetched orders for user", { userId, orderCount: totalCount });

//         res.status(200).json({
//             orders,
//             totalCount
//         });
//     } catch (error) {
//         logger.error("Error fetching orders", {
//             error: error.message,
//             stack: error.stack
//         });
//         res.status(500).json({
//             message: "Server error",
//             error: error.message
//         });
//     }
// });

// // ✅ New Route: Get All Orders
// router.get('/orders', async (req, res) => {
//     logger.info("Received request to fetch all orders");

//     try {
//         const orders = await Order.find().sort({ createdAt: -1 }); // optional: newest first
//         logger.info("Fetched all orders", { totalOrders: orders.length });
//         res.status(200).json({ orders });
//     } catch (error) {
//         logger.error("Error fetching all orders", { error: error.message, stack: error.stack });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


// // Get Total Order Count
// router.get('/totalOrdercount', async (req, res) => {
//     logger.info("Received request to get total order count");

//     try {
//         const count = await Order.countDocuments();
//         logger.info("Fetched total order count", { count });
//         res.status(200).json({ totalOrders: count });
//     } catch (error) {
//         logger.error("Error getting order count", { error: error.message, stack: error.stack });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


// // Update Order Status by ID
// router.patch('/orders/:orderId/status', async (req, res) => {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     logger.info("Received request to update order status", { orderId, status });

//     if (!status || !['Pending', 'Delivered', 'Cancelled'].includes(status)) {
//         logger.warn("Invalid or missing status in update request", { status });
//         return res.status(400).json({ message: "Invalid or missing status" });
//     }

//     try {
//         const updatedOrder = await Order.findByIdAndUpdate(
//             orderId,
//             { status },
//             { new: true }
//         );

//         if (!updatedOrder) {
//             logger.warn("Order not found for status update", { orderId });
//             return res.status(404).json({ message: "Order not found" });
//         }

//         logger.info("Order status updated successfully", { orderId, status });

//         res.status(200).json({ message: "Order status updated", order: updatedOrder });
//     } catch (error) {
//         logger.error("Error updating order status", { error: error.message, stack: error.stack });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// module.exports = router;

// router.get('/', (req, res) => {
//     res.send("API Working");
// });
// module.exports = router;

// //2:
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { logger } = require("../utils/logger");
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
// const sendOrderEmail = require('../utils/sendOrderEmail');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// // 1: Create Order Route
// router.post('/createOrder', async (req, res) => {
//     const { userId, items, address, phone, totalAmount, paymentId } = req.body;

//     console.log("Creating order:", req.body);

//     // Debug log to see what's being received
//     console.log("Received createOrder request:", {
//         userId: !!userId,
//         items: items?.length,
//         address: !!address,
//         phone: !!phone,
//         totalAmount: !!totalAmount,
//         paymentId: !!paymentId
//     });

//     // Better validation with specific error messages
//     if (!userId) {
//         return res.status(400).json({ message: "Missing required field: userId" });
//     }
//     if (!items?.length) {
//         return res.status(400).json({ message: "Missing required field: items" });
//     }
//     if (!address) {
//         return res.status(400).json({ message: "Missing required field: address" });
//     }
//     if (!phone) {
//         return res.status(400).json({ message: "Missing required field: phone" });
//     }
//     if (!totalAmount) {
//         return res.status(400).json({ message: "Missing required field: totalAmount" });
//     }

//     try {
//         // Create Razorpay Order via API
//         const razorpayOrder = await razorpayInstance.orders.create({
//             amount: totalAmount * 100,  // amount in paise
//             currency: "INR",
//             receipt: `receipt_order_${Date.now()}`,
//             payment_capture: 1, // Auto capture enabled
//         });

//         // Save order in your DB with razorpayOrderId
//         const newOrder = new Order({
//             userId,
//             items,
//             address,
//             phone,
//             totalAmount,
//             paymentId,
//             razorpayOrderId: razorpayOrder.id,
//             paymentInfo: {
//                 status: 'created',
//                 amount: totalAmount,
//                 updatedAt: new Date()
//             },
//         });
//         await newOrder.save();

//         console.log("Order created with razorpayOrderId:", razorpayOrder.id);

//         // OPTIONAL: Fetch user's email from DB or pass it via frontend
//         const userEmail = req.body.email; // <-- Ensure this is included in frontend request
//         if (userEmail) {
//             try {
//                 await sendOrderEmail(userEmail, newOrder);
//                 console.log("Order confirmation email sent to", userEmail);
//             } catch (emailError) {
//                 console.error("Failed to send order email:", emailError.message);
//             }
//         }

//         res.status(201).json({
//             message: "Order placed successfully",
//             orderId: newOrder._id,
//             razorpayOrderId: razorpayOrder.id,
//             razorpayOrder,
//         });
//     } catch (error) {
//         console.error("Error placing order:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 2:
// Create transporter (reuse from app.js or create here)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// // 1: Email sending function with simple ui
// const sendOrderEmail = async (toEmail, orderData) => {
//     const recipients = [toEmail];

//     // Also send to company email if it's different from user email
//     if (toEmail !== process.env.EMAIL_USERNAME) {
//         recipients.push(process.env.EMAIL_USERNAME);
//     }

//     const { items, totalAmount, _id: orderId, address, phone } = orderData;

//     const itemList = items.map(item => `
//         <li>
//             <strong>${item.name}</strong> - Qty: ${item.quantity}, Price: ₹${item.price}
//         </li>
//     `).join('');

//     const mailOptions = {
//         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
//         to: recipients.join(', '), // Join multiple recipients
//         subject: `🧾 Order Confirmation - Order #${orderId}`,
//         html: `
//             <h2>Thank you for your order!</h2>
//             <p>Your order has been placed successfully.</p>
//             <h3>Order Details:</h3>
//             <ul>${itemList}</ul>
//             <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
//             <p><strong>Shipping Address:</strong> ${address}</p>
//             <p><strong>Phone:</strong> ${phone}</p>
//             <br/>
//             <p>We'll notify you when your order is shipped.</p>
//             <p>Best regards,<br/>Chauhan Sons Jewellers</p>
//         `,
//     };

//     return transporter.sendMail(mailOptions);
// };

// // 2: Refactored email sending function
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

// Create Order Route
router.post('/createOrder', async (req, res) => {
    const { userId, items, address, phone, totalAmount, paymentId, email } = req.body;

    console.log("Creating order:", req.body);

    // Validation with specific error messages
    if (!userId) {
        return res.status(400).json({ message: "Missing required field: userId" });
    }
    if (!items?.length) {
        return res.status(400).json({ message: "Missing required field: items" });
    }
    if (!address) {
        return res.status(400).json({ message: "Missing required field: address" });
    }
    if (!phone) {
        return res.status(400).json({ message: "Missing required field: phone" });
    }
    if (!totalAmount) {
        return res.status(400).json({ message: "Missing required field: totalAmount" });
    }
    if (!email) {
        return res.status(400).json({ message: "Missing required field: email" });
    }

    try {
        // Create Razorpay Order via API
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: totalAmount * 100,  // amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1, // Auto capture enabled
        });

        // Save order in your DB with razorpayOrderId
        const newOrder = new Order({
            userId,
            items,
            address,
            phone,
            totalAmount,
            paymentId,
            razorpayOrderId: razorpayOrder.id,
            paymentInfo: {
                status: 'created',
                amount: totalAmount,
                updatedAt: new Date(),
            },
        });
        await newOrder.save();

        // Send order confirmation email
        try {
            await sendOrderEmail(email, newOrder);
            console.log("Order confirmation email sent to", email, "and", process.env.EMAIL_USERNAME);
        } catch (emailError) {
            console.error("Failed to send order email:", emailError.message);
            // Don't fail the order creation, but log the error
        }

        res.status(201).json({
            message: "Order placed successfully",
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            razorpayOrder,
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Enhanced payment status route with better error handling
router.get('/paymentStatus/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // If no razorpayOrderId, return the existing paymentInfo or default
        if (!order.razorpayOrderId) {
            return res.status(200).json({
                paymentInfo: order.paymentInfo || {
                    status: 'pending',
                    amount: order.totalAmount,
                    paymentId: order.paymentId || null
                },
                razorpayOrder: null,
                razorpayPayments: []
            });
        }

        try {
            // Fetch latest Razorpay order details
            const razorpayOrder = await razorpayInstance.orders.fetch(order.razorpayOrderId);

            // Fetch all payments for this Razorpay order
            const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);

            // Get the latest payment (if any)
            const latestPayment = payments.items.length ? payments.items[0] : null;

            // Update paymentInfo in your order DB
            if (latestPayment) {
                order.paymentInfo = {
                    paymentId: latestPayment.id,
                    amount: latestPayment.amount / 100,
                    status: latestPayment.status,
                    method: latestPayment.method,
                    updatedAt: new Date(),
                };
                await order.save();
            } else {
                // No payment found, but order exists
                order.paymentInfo = {
                    ...order.paymentInfo,
                    status: 'created',
                    updatedAt: new Date()
                };
                await order.save();
            }

            // If order is cancelled and payment was captured, check for refunds
            let refundData = null;
            if (order.status === 'Cancelled' && latestPayment && latestPayment.status === 'captured') {
                try {
                    const refunds = await razorpayInstance.payments.fetchMultipleRefund(latestPayment.id);
                    if (refunds.items.length > 0) {
                        refundData = refunds.items[0]; // Get latest refund
                    }
                } catch (refundError) {
                    console.log('No refunds found for this payment');
                }
            }

            res.status(200).json({
                paymentInfo: order.paymentInfo || null,
                refundInfo: order.refundInfo || null,
                refundData,
                razorpayOrder,
                razorpayPayments: payments.items,
            });

        } catch (razorpayError) {
            console.error("Razorpay API error:", razorpayError);
            // Return order data even if Razorpay API fails
            res.status(200).json({
                paymentInfo: order.paymentInfo || {
                    status: 'unknown',
                    amount: order.totalAmount
                },
                refundInfo: order.refundInfo || null,
                refundData: null,
                razorpayOrder: null,
                razorpayPayments: [],
                error: 'Unable to fetch latest payment status from Razorpay'
            });
        }

    } catch (error) {
        console.error("Error fetching payment status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// New route to manually capture payment (for admin)
router.post('/capturePayment/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { amount } = req.body; // Optional: partial capture

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({ message: "No payment ID found for this order" });
        }

        // Capture the payment
        const captureAmount = amount ? amount * 100 : order.totalAmount * 100;
        const capturedPayment = await razorpayInstance.payments.capture(
            order.paymentInfo.paymentId,
            captureAmount,
            "INR"
        );

        // Update order with captured payment info
        order.paymentInfo = {
            ...order.paymentInfo,
            status: 'captured',
            amount: capturedPayment.amount / 100,
            updatedAt: new Date()
        };
        await order.save();

        logger.info("Payment captured successfully", {
            orderId,
            paymentId: order.paymentInfo.paymentId,
            amount: capturedPayment.amount / 100
        });

        res.status(200).json({
            message: "Payment captured successfully",
            paymentInfo: order.paymentInfo
        });

    } catch (error) {
        logger.error("Error capturing payment", { orderId, error: error.message });
        res.status(500).json({ message: "Failed to capture payment", error: error.message });
    }
});

// Check payment status by Razorpay Order ID (as suggested by Razorpay support)
router.get('/checkPaymentStatus/:razorpayOrderId', async (req, res) => {
    const { razorpayOrderId } = req.params;

    try {
        // Fetch Razorpay order details
        const razorpayOrder = await razorpayInstance.orders.fetch(razorpayOrderId);

        // Fetch all payments for this Razorpay order
        const payments = await razorpayInstance.orders.fetchPayments(razorpayOrderId);

        // Get the latest payment (if any)
        const latestPayment = payments.items.length ? payments.items[0] : null;

        // Find the order in our database
        const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });

        // Update paymentInfo in your order DB if payment exists
        if (latestPayment && order) {
            order.paymentInfo = {
                paymentId: latestPayment.id,
                amount: latestPayment.amount / 100,
                status: latestPayment.status, // 'captured', 'failed', 'authorized', etc.
                method: latestPayment.method,
                updatedAt: new Date(),
            };
            await order.save();
        }

        // Return comprehensive payment info
        res.status(200).json({
            razorpayOrder,
            paymentInfo: latestPayment ? {
                paymentId: latestPayment.id,
                amount: latestPayment.amount / 100,
                status: latestPayment.status,
                method: latestPayment.method,
                createdAt: latestPayment.created_at,
            } : null,
            allPayments: payments.items,
            orderStatus: order ? order.status : null,
        });
    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get Orders by User ID with live payment status
router.get('/orders/:userId', async (req, res) => {
    const { userId } = req.params;

    logger.info("Received getOrders request", { userId });

    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        // For each order, fetch latest payment and refund info
        const ordersWithLiveInfo = await Promise.all(
            orders.map(async (order) => {
                // Fetch live payment status if razorpayOrderId exists
                if (order.razorpayOrderId) {
                    try {
                        const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
                        const latestPayment = payments.items.length ? payments.items[0] : null;

                        if (latestPayment) {
                            order.paymentInfo = {
                                paymentId: latestPayment.id,
                                amount: latestPayment.amount / 100,
                                status: latestPayment.status,
                                method: latestPayment.method,
                                updatedAt: new Date()
                            };
                        }
                    } catch (paymentError) {
                        console.log('Error fetching payment for order:', order._id, paymentError.message);
                    }
                }

                // Fetch refund info if applicable
                if (order.status === 'Cancelled' && order.refundInfo?.refundId) {
                    try {
                        const refundDetails = await razorpayInstance.refunds.fetch(order.refundInfo.refundId);
                        order.refundInfo = {
                            ...order.refundInfo.toObject(),
                            ...refundDetails
                        };
                    } catch (error) {
                        console.log('Could not fetch refund details:', error.message);
                    }
                }
                return order;
            })
        );

        res.status(200).json({
            orders: ordersWithLiveInfo,
            totalCount: orders.length
        });
    } catch (error) {
        logger.error("Error fetching orders", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// Get All Orders (for admin) with live payment status
router.get('/orders', async (req, res) => {
    logger.info("Received request to fetch all orders");

    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        // Fetch live payment status for all orders
        const ordersWithLiveStatus = await Promise.all(
            orders.map(async (order) => {
                if (order.razorpayOrderId) {
                    try {
                        const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
                        const latestPayment = payments.items.length ? payments.items[0] : null;

                        if (latestPayment) {
                            order.paymentInfo = {
                                paymentId: latestPayment.id,
                                amount: latestPayment.amount / 100,
                                status: latestPayment.status,
                                method: latestPayment.method,
                                updatedAt: new Date()
                            };
                        }
                    } catch (paymentError) {
                        console.log('Error fetching payment for order:', order._id);
                    }
                }
                return order;
            })
        );

        logger.info("Fetched all orders with live payment status", { totalOrders: orders.length });
        res.status(200).json({ orders: ordersWithLiveStatus });
    } catch (error) {
        logger.error("Error fetching all orders", { error: error.message, stack: error.stack });
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get Total Order Count
router.get('/totalOrdercount', async (req, res) => {
    logger.info("Received request to get total order count");

    try {
        const count = await Order.countDocuments();
        logger.info("Fetched total order count", { count });
        res.status(200).json({ totalOrders: count });
    } catch (error) {
        logger.error("Error getting order count", { error: error.message, stack: error.stack });
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Enhanced Update Order Status with Automatic Refund Processing
router.put('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status, cancelReason } = req.body;

    logger.info("Received request to update order status", { orderId, status, cancelReason });

    // Validation for status
    if (!status || !['Pending', 'Delivered', 'Cancelled'].includes(status)) {
        logger.warn("Invalid or missing status in update request", { status });
        return res.status(400).json({ message: "Invalid or missing status" });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            logger.warn("Order not found for status update", { orderId });
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch latest payment status before proceeding
        if (order.razorpayOrderId && !order.paymentInfo?.paymentId) {
            try {
                const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
                const latestPayment = payments.items.length ? payments.items[0] : null;

                if (latestPayment) {
                    order.paymentInfo = {
                        paymentId: latestPayment.id,
                        amount: latestPayment.amount / 100,
                        status: latestPayment.status,
                        method: latestPayment.method,
                        updatedAt: new Date()
                    };
                    await order.save();
                }
            } catch (paymentError) {
                console.log('Error fetching payment status before update:', paymentError.message);
            }
        }

        // If cancelling order, process refund automatically
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            const refundResult = await processAutomaticRefund(order, cancelReason);
            if (refundResult.success) {
                order.refundInfo = refundResult.refundInfo;
            }
        }

        // Update order status
        const updateData = {
            status: status,
            ...(status === 'Cancelled' && {
                cancelReason: cancelReason || 'Cancelled by admin',
                cancelledBy: 'admin',
                cancelledAt: new Date()
            })
        };

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            { new: true }
        );

        logger.info("Order status updated successfully", { orderId, status });

        res.status(200).json({
            message: "Order status updated",
            order: updatedOrder,
            refundProcessed: status === 'Cancelled' ? true : false
        });
    } catch (error) {
        logger.error("Error updating order status", { error: error.message, stack: error.stack });
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Function to process automatic refund
async function processAutomaticRefund(order, cancelReason) {
    try {
        // Check if payment exists and is captured or authorized
        if (!order.paymentInfo?.paymentId) {
            return { success: false, reason: 'Payment ID missing' };
        }

        if (!['captured', 'authorized'].includes(order.paymentInfo?.status)) {
            return { success: false, reason: 'Payment not captured or authorized' };
        }

        // If payment is authorized but not captured, we need to capture first then refund
        if (order.paymentInfo.status === 'authorized') {
            try {
                await razorpayInstance.payments.capture(
                    order.paymentInfo.paymentId,
                    order.totalAmount * 100,
                    "INR"
                );
                logger.info("Payment captured for refund", { orderId: order._id });
            } catch (captureError) {
                logger.error("Failed to capture payment for refund", { error: captureError.message });
                return { success: false, reason: 'Failed to capture payment before refund' };
            }
        }

        // Create refund with Razorpay
        const refundData = {
            amount: order.totalAmount * 100, // Full refund in paise
            speed: 'optimum', // Can be 'normal' or 'optimum'
            notes: {
                reason: cancelReason || 'Order cancelled by admin',
                orderId: order._id.toString()
            },
            receipt: `refund_${order._id}_${Date.now()}`
        };

        const refund = await razorpayInstance.payments.refund(order.paymentInfo.paymentId, refundData);

        // Calculate estimated settlement date (typically 5-7 business days for optimum, 7-10 for normal)
        const estimatedDays = refundData.speed === 'optimum' ? 5 : 7;
        const estimatedSettlement = new Date();
        estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

        const refundInfo = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            speed: refund.speed_processed || refundData.speed,
            reason: cancelReason || 'Order cancelled by admin',
            createdAt: new Date(refund.created_at * 1000),
            estimatedSettlement,
            notes: `Refund processed automatically due to order cancellation. Expected settlement in ${estimatedDays} business days.`
        };

        logger.info("Automatic refund processed", {
            orderId: order._id,
            refundId: refund.id,
            amount: refund.amount / 100
        });

        return { success: true, refundInfo };

    } catch (error) {
        logger.error("Error processing automatic refund", {
            orderId: order._id,
            error: error.message
        });
        return { success: false, reason: error.message };
    }
}

// New route to manually process refund (for admin)
router.post('/orders/:orderId/refund', async (req, res) => {
    const { orderId } = req.params;
    const { amount, reason, speed = 'optimum' } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({ message: "Payment ID missing" });
        }

        if (!['captured', 'authorized'].includes(order.paymentInfo?.status)) {
            return res.status(400).json({ message: "Payment not captured or authorized" });
        }

        // If payment is authorized, capture it first
        if (order.paymentInfo.status === 'authorized') {
            try {
                await razorpayInstance.payments.capture(
                    order.paymentInfo.paymentId,
                    order.totalAmount * 100,
                    "INR"
                );
            } catch (captureError) {
                return res.status(400).json({ message: "Failed to capture payment before refund" });
            }
        }

        const refundAmount = amount || order.totalAmount;
        const refundData = {
            amount: refundAmount * 100,
            speed,
            notes: {
                reason: reason || 'Manual refund by admin',
                orderId: order._id.toString()
            },
            receipt: `refund_${order._id}_${Date.now()}`
        };

        const refund = await razorpayInstance.payments.refund(order.paymentInfo.paymentId, refundData);

        const estimatedDays = speed === 'optimum' ? 5 : 7;
        const estimatedSettlement = new Date();
        estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

        const refundInfo = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            speed: refund.speed_processed || speed,
            reason: reason || 'Manual refund by admin',
            createdAt: new Date(refund.created_at * 1000),
            estimatedSettlement,
            notes: `Manual refund processed. Expected settlement in ${estimatedDays} business days.`
        };

        // Update order with refund info
        order.refundInfo = refundInfo;
        order.status = 'Cancelled';
        await order.save();

        logger.info("Manual refund processed", {
            orderId,
            refundId: refund.id,
            amount: refund.amount / 100
        });

        res.status(200).json({
            message: "Refund processed successfully",
            refund: refundInfo
        });

    } catch (error) {
        logger.error("Error processing manual refund", { orderId, error: error.message });
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get refund status for a specific order
router.get('/orders/:orderId/refund-status', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.refundInfo?.refundId) {
            return res.status(200).json({
                message: "No refund found for this order",
                refundInfo: null
            });
        }

        // Fetch latest refund details from Razorpay
        const refund = await razorpayInstance.refunds.fetch(order.refundInfo.refundId);

        // Update refund info with latest data
        order.refundInfo = {
            ...order.refundInfo.toObject(),
            status: refund.status,
            processedAt: refund.processed_at ? new Date(refund.processed_at * 1000) : null,
            notes: order.refundInfo.notes
        };
        await order.save();

        res.status(200).json({
            refundInfo: order.refundInfo,
            razorpayRefundDetails: refund
        });

    } catch (error) {
        logger.error("Error fetching refund status", { orderId, error: error.message });
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Test route to check if payment route is working
router.get('/test-payment-route', (req, res) => {
    res.json({ message: "Payment route is working" });
});

// Test route for updatePayment
router.get('/test-update-payment', (req, res) => {
    res.json({ message: "Update payment route is working" });
});

router.get('/', (req, res) => {
    res.send("API Working");
});



module.exports = router;