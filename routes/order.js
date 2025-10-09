// // const express = require('express');
// // const router = express.Router();
// // const Order = require('../models/order');
// // const { logger } = require("../utils/logger");

// // // Create Order Route
// // router.post('/createOrder', async (req, res) => {
// //     const { userId, items, address, phone, totalAmount, paymentId } = req.body;

// //     logger.info("Received createOrder request", { userId, itemCount: items?.length, totalAmount });

// //     if (!userId || !items?.length || !address || !phone || !totalAmount) {
// //         logger.warn("Missing required fields in createOrder request", { body: req.body });
// //         return res.status(400).json({ message: "Missing required fields" });
// //     }

// //     try {
// //         const newOrder = new Order({ userId, items, address, phone, totalAmount, paymentId });
// //         await newOrder.save();

// //         logger.info("Order created successfully", { orderId: newOrder._id, userId });

// //         res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
// //     } catch (error) {
// //         logger.error("Error placing order", { error: error.message, stack: error.stack });
// //         res.status(500).json({ message: "Server error", error: error.message });
// //     }
// // });

// // // Get Orders by User ID
// // router.get('/orders/:userId', async (req, res) => {
// //     const { userId } = req.params;

// //     logger.info("Received getOrders request", { userId });

// //     try {
// //         const orders = await Order.find({ userId });

// //         const totalCount = orders.length;

// //         logger.info("Fetched orders for user", { userId, orderCount: totalCount });

// //         res.status(200).json({
// //             orders,
// //             totalCount
// //         });
// //     } catch (error) {
// //         logger.error("Error fetching orders", {
// //             error: error.message,
// //             stack: error.stack
// //         });
// //         res.status(500).json({
// //             message: "Server error",
// //             error: error.message
// //         });
// //     }
// // });

// // // ✅ New Route: Get All Orders
// // router.get('/orders', async (req, res) => {
// //     logger.info("Received request to fetch all orders");

// //     try {
// //         const orders = await Order.find().sort({ createdAt: -1 }); // optional: newest first
// //         logger.info("Fetched all orders", { totalOrders: orders.length });
// //         res.status(200).json({ orders });
// //     } catch (error) {
// //         logger.error("Error fetching all orders", { error: error.message, stack: error.stack });
// //         res.status(500).json({ message: "Server error", error: error.message });
// //     }
// // });


// // // Get Total Order Count
// // router.get('/totalOrdercount', async (req, res) => {
// //     logger.info("Received request to get total order count");

// //     try {
// //         const count = await Order.countDocuments();
// //         logger.info("Fetched total order count", { count });
// //         res.status(200).json({ totalOrders: count });
// //     } catch (error) {
// //         logger.error("Error getting order count", { error: error.message, stack: error.stack });
// //         res.status(500).json({ message: "Server error", error: error.message });
// //     }
// // });


// // // Update Order Status by ID
// // router.patch('/orders/:orderId/status', async (req, res) => {
// //     const { orderId } = req.params;
// //     const { status } = req.body;

// //     logger.info("Received request to update order status", { orderId, status });

// //     if (!status || !['Pending', 'Delivered', 'Cancelled'].includes(status)) {
// //         logger.warn("Invalid or missing status in update request", { status });
// //         return res.status(400).json({ message: "Invalid or missing status" });
// //     }

// //     try {
// //         const updatedOrder = await Order.findByIdAndUpdate(
// //             orderId,
// //             { status },
// //             { new: true }
// //         );

// //         if (!updatedOrder) {
// //             logger.warn("Order not found for status update", { orderId });
// //             return res.status(404).json({ message: "Order not found" });
// //         }

// //         logger.info("Order status updated successfully", { orderId, status });

// //         res.status(200).json({ message: "Order status updated", order: updatedOrder });
// //     } catch (error) {
// //         logger.error("Error updating order status", { error: error.message, stack: error.stack });
// //         res.status(500).json({ message: "Server error", error: error.message });
// //     }
// // });

// // module.exports = router;

// // router.get('/', (req, res) => {
// //     res.send("API Working");
// // });
// // module.exports = router;

// // //2:
// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order');
// const { logger } = require("../utils/logger");
// const Razorpay = require('razorpay');
// const nodemailer = require('nodemailer');
// // const sendOrderEmail = require('../utils/sendOrderEmail');

// // Initialize Razorpay instance
// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


// // // 1: Create Order Route
// // router.post('/createOrder', async (req, res) => {
// //     const { userId, items, address, phone, totalAmount, paymentId } = req.body;

// //     console.log("Creating order:", req.body);

// //     // Debug log to see what's being received
// //     console.log("Received createOrder request:", {
// //         userId: !!userId,
// //         items: items?.length,
// //         address: !!address,
// //         phone: !!phone,
// //         totalAmount: !!totalAmount,
// //         paymentId: !!paymentId
// //     });

// //     // Better validation with specific error messages
// //     if (!userId) {
// //         return res.status(400).json({ message: "Missing required field: userId" });
// //     }
// //     if (!items?.length) {
// //         return res.status(400).json({ message: "Missing required field: items" });
// //     }
// //     if (!address) {
// //         return res.status(400).json({ message: "Missing required field: address" });
// //     }
// //     if (!phone) {
// //         return res.status(400).json({ message: "Missing required field: phone" });
// //     }
// //     if (!totalAmount) {
// //         return res.status(400).json({ message: "Missing required field: totalAmount" });
// //     }

// //     try {
// //         // Create Razorpay Order via API
// //         const razorpayOrder = await razorpayInstance.orders.create({
// //             amount: totalAmount * 100,  // amount in paise
// //             currency: "INR",
// //             receipt: `receipt_order_${Date.now()}`,
// //             payment_capture: 1, // Auto capture enabled
// //         });

// //         // Save order in your DB with razorpayOrderId
// //         const newOrder = new Order({
// //             userId,
// //             items,
// //             address,
// //             phone,
// //             totalAmount,
// //             paymentId,
// //             razorpayOrderId: razorpayOrder.id,
// //             paymentInfo: {
// //                 status: 'created',
// //                 amount: totalAmount,
// //                 updatedAt: new Date()
// //             },
// //         });
// //         await newOrder.save();

// //         console.log("Order created with razorpayOrderId:", razorpayOrder.id);

// //         // OPTIONAL: Fetch user's email from DB or pass it via frontend
// //         const userEmail = req.body.email; // <-- Ensure this is included in frontend request
// //         if (userEmail) {
// //             try {
// //                 await sendOrderEmail(userEmail, newOrder);
// //                 console.log("Order confirmation email sent to", userEmail);
// //             } catch (emailError) {
// //                 console.error("Failed to send order email:", emailError.message);
// //             }
// //         }

// //         res.status(201).json({
// //             message: "Order placed successfully",
// //             orderId: newOrder._id,
// //             razorpayOrderId: razorpayOrder.id,
// //             razorpayOrder,
// //         });
// //     } catch (error) {
// //         console.error("Error placing order:", error);
// //         res.status(500).json({ message: "Server error", error: error.message });
// //     }
// // });

// // // 2:
// // Create transporter (reuse from app.js or create here)
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// // // 1: Email sending function with simple ui
// // const sendOrderEmail = async (toEmail, orderData) => {
// //     const recipients = [toEmail];

// //     // Also send to company email if it's different from user email
// //     if (toEmail !== process.env.EMAIL_USERNAME) {
// //         recipients.push(process.env.EMAIL_USERNAME);
// //     }

// //     const { items, totalAmount, _id: orderId, address, phone } = orderData;

// //     const itemList = items.map(item => `
// //         <li>
// //             <strong>${item.name}</strong> - Qty: ${item.quantity}, Price: ₹${item.price}
// //         </li>
// //     `).join('');

// //     const mailOptions = {
// //         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
// //         to: recipients.join(', '), // Join multiple recipients
// //         subject: `🧾 Order Confirmation - Order #${orderId}`,
// //         html: `
// //             <h2>Thank you for your order!</h2>
// //             <p>Your order has been placed successfully.</p>
// //             <h3>Order Details:</h3>
// //             <ul>${itemList}</ul>
// //             <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
// //             <p><strong>Shipping Address:</strong> ${address}</p>
// //             <p><strong>Phone:</strong> ${phone}</p>
// //             <br/>
// //             <p>We'll notify you when your order is shipped.</p>
// //             <p>Best regards,<br/>Chauhan Sons Jewellers</p>
// //         `,
// //     };

// //     return transporter.sendMail(mailOptions);
// // };

// // // 2: Refactored email sending function
// const sendOrderEmail = async (toEmail, orderData) => {
//     const recipients = [toEmail];

//     // Also send to company email if it's different from user email
//     if (toEmail !== process.env.EMAIL_USERNAME) {
//         recipients.push(process.env.EMAIL_USERNAME);
//     }

//     const { items, totalAmount, _id: orderId, address, phone, createdAt } = orderData;

//     // Format date
//     const orderDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });

//     // Calculate subtotal and format items
//     const itemsHTML = items.map((item, index) => `
//         <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 15px 10px; vertical-align: top;">
//                 <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${item.name}</div>
//                 <div style="font-size: 13px; color: #666;">Quantity: ${item.quantity}</div>
//             </td>
//             <td style="padding: 15px 10px; text-align: right; vertical-align: top; font-weight: 600; color: #333;">
//                 ₹${item.price.toLocaleString('en-IN')}
//             </td>
//         </tr>
//     `).join('');

//     const mailOptions = {
//         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
//         to: recipients.join(', '),
//         subject: `Order Confirmed - #${orderId}`,
//         html: `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Order Confirmation</title>
// </head>
// <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
//         <tr>
//             <td align="center">
//                 <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">

//                     <!-- Header -->
//                     <tr>
//                         <td style="background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); padding: 30px; text-align: center;">
//                             <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Chauhan Sons Jewellers</h1>
//                             <p style="margin: 8px 0 0 0; color: #f0d4b0; font-size: 14px; letter-spacing: 1px;">FINE JEWELRY SINCE 1969</p>
//                         </td>
//                     </tr>

//                     <!-- Success Message -->
//                     <tr>
//                         <td style="padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #7d2a25;">
//                             <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 20px;">
//                                 <span style="color: #2e7d32; font-size: 32px;">✓</span>
//                             </div>
//                             <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
//                             <p style="margin: 0; color: #666; font-size: 15px;">Thank you for your purchase. Your order has been received and is being processed.</p>
//                         </td>
//                     </tr>

//                     <!-- Order Info -->
//                     <tr>
//                         <td style="padding: 30px;">
//                             <table width="100%" cellpadding="0" cellspacing="0">
//                                 <tr>
//                                     <td style="padding-bottom: 20px;">
//                                         <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
//                                             <tr>
//                                                 <td style="width: 50%; padding: 10px;">
//                                                     <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Number</div>
//                                                     <div style="font-size: 16px; color: #333; font-weight: 600;">#${orderId}</div>
//                                                 </td>
//                                                 <td style="width: 50%; padding: 10px; text-align: right;">
//                                                     <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Date</div>
//                                                     <div style="font-size: 16px; color: #333; font-weight: 600;">${orderDate}</div>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- Order Items -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
//                                 <thead>
//                                     <tr style="background-color: #f9f9f9;">
//                                         <th style="padding: 15px 10px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Item</th>
//                                         <th style="padding: 15px 10px; text-align: right; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Price</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${itemsHTML}
//                                 </tbody>
//                             </table>

//                             <!-- Order Summary -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
//                                 <tr>
//                                     <td style="padding: 15px 0; border-top: 2px solid #eee;">
//                                         <table width="100%" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="padding: 8px 0; color: #666; font-size: 15px;">Subtotal</td>
//                                                 <td style="padding: 8px 0; text-align: right; color: #333; font-size: 15px; font-weight: 500;">₹${totalAmount.toLocaleString('en-IN')}</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 8px 0; color: #666; font-size: 15px;">Shipping</td>
//                                                 <td style="padding: 8px 0; text-align: right; color: #2e7d32; font-size: 15px; font-weight: 600;">FREE</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 15px 0 0 0; color: #333; font-size: 18px; font-weight: 700; border-top: 2px solid #7d2a25;">Order Total</td>
//                                                 <td style="padding: 15px 0 0 0; text-align: right; color: #7d2a25; font-size: 20px; font-weight: 700; border-top: 2px solid #7d2a25;">₹${totalAmount.toLocaleString('en-IN')}</td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- Delivery Info -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td>
//                                         <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #7d2a25;">
//                                             <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Delivery Address</h3>
//                                             <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.6;">${address}</p>
//                                             <p style="margin: 0; color: #666; font-size: 14px;">
//                                                 <strong style="color: #333;">Contact:</strong> ${phone}
//                                             </p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- What's Next -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td>
//                                         <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">What happens next?</h3>
//                                         <table width="100%" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top; width: 30px;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     We'll send you a shipping confirmation email with tracking details
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     Your order will be carefully packaged and shipped
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     Enjoy your beautiful jewelry from Chauhan Sons!
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- CTA Button -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td align="center">
//                                         <a href="https://chauhansonsjewellers.com" style="display: inline-block; background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">View Order Status</a>
//                                     </td>
//                                 </tr>
//                             </table>

//                         </td>
//                     </tr>

//                     <!-- Footer -->
//                     <tr>
//                         <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
//                             <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Need help with your order?</p>
//                             <p style="margin: 0 0 15px 0;">
//                                 <a href="mailto:chauhansons69@yahoo.com" style="color: #7d2a25; text-decoration: none; font-weight: 600;">Contact Customer Support</a>
//                             </p>
//                             <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #ddd;">
//                                 <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">Chauhan Sons Jewellers</p>
//                                 <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} All rights reserved</p>
//                             </div>
//                         </td>
//                     </tr>

//                 </table>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
//         `,
//     };

//     return transporter.sendMail(mailOptions);
// };

// // Create Order Route
// router.post('/createOrder', async (req, res) => {
//     const { userId, items, address, phone, totalAmount, paymentId, email } = req.body;

//     console.log("Creating order:", req.body);

//     // Validation with specific error messages
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
//     if (!email) {
//         return res.status(400).json({ message: "Missing required field: email" });
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
//                 updatedAt: new Date(),
//             },
//         });
//         await newOrder.save();

//         // Send order confirmation email
//         try {
//             await sendOrderEmail(email, newOrder);
//             console.log("Order confirmation email sent to", email, "and", process.env.EMAIL_USERNAME);
//         } catch (emailError) {
//             console.error("Failed to send order email:", emailError.message);
//             // Don't fail the order creation, but log the error
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

// // Enhanced payment status route with better error handling
// router.get('/paymentStatus/:orderId', async (req, res) => {
//     const { orderId } = req.params;

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // If no razorpayOrderId, return the existing paymentInfo or default
//         if (!order.razorpayOrderId) {
//             return res.status(200).json({
//                 paymentInfo: order.paymentInfo || {
//                     status: 'pending',
//                     amount: order.totalAmount,
//                     paymentId: order.paymentId || null
//                 },
//                 razorpayOrder: null,
//                 razorpayPayments: []
//             });
//         }

//         try {
//             // Fetch latest Razorpay order details
//             const razorpayOrder = await razorpayInstance.orders.fetch(order.razorpayOrderId);

//             // Fetch all payments for this Razorpay order
//             const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);

//             // Get the latest payment (if any)
//             const latestPayment = payments.items.length ? payments.items[0] : null;

//             // Update paymentInfo in your order DB
//             if (latestPayment) {
//                 order.paymentInfo = {
//                     paymentId: latestPayment.id,
//                     amount: latestPayment.amount / 100,
//                     status: latestPayment.status,
//                     method: latestPayment.method,
//                     updatedAt: new Date(),
//                 };
//                 await order.save();
//             } else {
//                 // No payment found, but order exists
//                 order.paymentInfo = {
//                     ...order.paymentInfo,
//                     status: 'created',
//                     updatedAt: new Date()
//                 };
//                 await order.save();
//             }

//             // If order is cancelled and payment was captured, check for refunds
//             let refundData = null;
//             if (order.status === 'Cancelled' && latestPayment && latestPayment.status === 'captured') {
//                 try {
//                     const refunds = await razorpayInstance.payments.fetchMultipleRefund(latestPayment.id);
//                     if (refunds.items.length > 0) {
//                         refundData = refunds.items[0]; // Get latest refund
//                     }
//                 } catch (refundError) {
//                     console.log('No refunds found for this payment');
//                 }
//             }

//             res.status(200).json({
//                 paymentInfo: order.paymentInfo || null,
//                 refundInfo: order.refundInfo || null,
//                 refundData,
//                 razorpayOrder,
//                 razorpayPayments: payments.items,
//             });

//         } catch (razorpayError) {
//             console.error("Razorpay API error:", razorpayError);
//             // Return order data even if Razorpay API fails
//             res.status(200).json({
//                 paymentInfo: order.paymentInfo || {
//                     status: 'unknown',
//                     amount: order.totalAmount
//                 },
//                 refundInfo: order.refundInfo || null,
//                 refundData: null,
//                 razorpayOrder: null,
//                 razorpayPayments: [],
//                 error: 'Unable to fetch latest payment status from Razorpay'
//             });
//         }

//     } catch (error) {
//         console.error("Error fetching payment status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // New route to manually capture payment (for admin)
// router.post('/capturePayment/:orderId', async (req, res) => {
//     const { orderId } = req.params;
//     const { amount } = req.body; // Optional: partial capture

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.paymentInfo?.paymentId) {
//             return res.status(400).json({ message: "No payment ID found for this order" });
//         }

//         // Capture the payment
//         const captureAmount = amount ? amount * 100 : order.totalAmount * 100;
//         const capturedPayment = await razorpayInstance.payments.capture(
//             order.paymentInfo.paymentId,
//             captureAmount,
//             "INR"
//         );

//         // Update order with captured payment info
//         order.paymentInfo = {
//             ...order.paymentInfo,
//             status: 'captured',
//             amount: capturedPayment.amount / 100,
//             updatedAt: new Date()
//         };
//         await order.save();

//         logger.info("Payment captured successfully", {
//             orderId,
//             paymentId: order.paymentInfo.paymentId,
//             amount: capturedPayment.amount / 100
//         });

//         res.status(200).json({
//             message: "Payment captured successfully",
//             paymentInfo: order.paymentInfo
//         });

//     } catch (error) {
//         logger.error("Error capturing payment", { orderId, error: error.message });
//         res.status(500).json({ message: "Failed to capture payment", error: error.message });
//     }
// });

// // Check payment status by Razorpay Order ID (as suggested by Razorpay support)
// router.get('/checkPaymentStatus/:razorpayOrderId', async (req, res) => {
//     const { razorpayOrderId } = req.params;

//     try {
//         // Fetch Razorpay order details
//         const razorpayOrder = await razorpayInstance.orders.fetch(razorpayOrderId);

//         // Fetch all payments for this Razorpay order
//         const payments = await razorpayInstance.orders.fetchPayments(razorpayOrderId);

//         // Get the latest payment (if any)
//         const latestPayment = payments.items.length ? payments.items[0] : null;

//         // Find the order in our database
//         const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });

//         // Update paymentInfo in your order DB if payment exists
//         if (latestPayment && order) {
//             order.paymentInfo = {
//                 paymentId: latestPayment.id,
//                 amount: latestPayment.amount / 100,
//                 status: latestPayment.status, // 'captured', 'failed', 'authorized', etc.
//                 method: latestPayment.method,
//                 updatedAt: new Date(),
//             };
//             await order.save();
//         }

//         // Return comprehensive payment info
//         res.status(200).json({
//             razorpayOrder,
//             paymentInfo: latestPayment ? {
//                 paymentId: latestPayment.id,
//                 amount: latestPayment.amount / 100,
//                 status: latestPayment.status,
//                 method: latestPayment.method,
//                 createdAt: latestPayment.created_at,
//             } : null,
//             allPayments: payments.items,
//             orderStatus: order ? order.status : null,
//         });
//     } catch (error) {
//         console.error("Error checking payment status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Get Orders by User ID with live payment status
// router.get('/orders/:userId', async (req, res) => {
//     const { userId } = req.params;

//     logger.info("Received getOrders request", { userId });

//     try {
//         const orders = await Order.find({ userId }).sort({ createdAt: -1 });

//         // For each order, fetch latest payment and refund info
//         const ordersWithLiveInfo = await Promise.all(
//             orders.map(async (order) => {
//                 // Fetch live payment status if razorpayOrderId exists
//                 if (order.razorpayOrderId) {
//                     try {
//                         const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
//                         const latestPayment = payments.items.length ? payments.items[0] : null;

//                         if (latestPayment) {
//                             order.paymentInfo = {
//                                 paymentId: latestPayment.id,
//                                 amount: latestPayment.amount / 100,
//                                 status: latestPayment.status,
//                                 method: latestPayment.method,
//                                 updatedAt: new Date()
//                             };
//                         }
//                     } catch (paymentError) {
//                         console.log('Error fetching payment for order:', order._id, paymentError.message);
//                     }
//                 }

//                 // Fetch refund info if applicable
//                 if (order.status === 'Cancelled' && order.refundInfo?.refundId) {
//                     try {
//                         const refundDetails = await razorpayInstance.refunds.fetch(order.refundInfo.refundId);
//                         order.refundInfo = {
//                             ...order.refundInfo.toObject(),
//                             ...refundDetails
//                         };
//                     } catch (error) {
//                         console.log('Could not fetch refund details:', error.message);
//                     }
//                 }
//                 return order;
//             })
//         );

//         res.status(200).json({
//             orders: ordersWithLiveInfo,
//             totalCount: orders.length
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

// // Get All Orders (for admin) with live payment status
// router.get('/orders', async (req, res) => {
//     logger.info("Received request to fetch all orders");

//     try {
//         const orders = await Order.find().sort({ createdAt: -1 });

//         // Fetch live payment status for all orders
//         const ordersWithLiveStatus = await Promise.all(
//             orders.map(async (order) => {
//                 if (order.razorpayOrderId) {
//                     try {
//                         const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
//                         const latestPayment = payments.items.length ? payments.items[0] : null;

//                         if (latestPayment) {
//                             order.paymentInfo = {
//                                 paymentId: latestPayment.id,
//                                 amount: latestPayment.amount / 100,
//                                 status: latestPayment.status,
//                                 method: latestPayment.method,
//                                 updatedAt: new Date()
//                             };
//                         }
//                     } catch (paymentError) {
//                         console.log('Error fetching payment for order:', order._id);
//                     }
//                 }
//                 return order;
//             })
//         );

//         logger.info("Fetched all orders with live payment status", { totalOrders: orders.length });
//         res.status(200).json({ orders: ordersWithLiveStatus });
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

// // Enhanced Update Order Status with Automatic Refund Processing
// router.put('/orders/:orderId/status', async (req, res) => {
//     const { orderId } = req.params;
//     const { status, cancelReason } = req.body;

//     logger.info("Received request to update order status", { orderId, status, cancelReason });

//     // Validation for status
//     if (!status || !['Pending', 'Delivered', 'Cancelled'].includes(status)) {
//         logger.warn("Invalid or missing status in update request", { status });
//         return res.status(400).json({ message: "Invalid or missing status" });
//     }

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             logger.warn("Order not found for status update", { orderId });
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // Fetch latest payment status before proceeding
//         if (order.razorpayOrderId && !order.paymentInfo?.paymentId) {
//             try {
//                 const payments = await razorpayInstance.orders.fetchPayments(order.razorpayOrderId);
//                 const latestPayment = payments.items.length ? payments.items[0] : null;

//                 if (latestPayment) {
//                     order.paymentInfo = {
//                         paymentId: latestPayment.id,
//                         amount: latestPayment.amount / 100,
//                         status: latestPayment.status,
//                         method: latestPayment.method,
//                         updatedAt: new Date()
//                     };
//                     await order.save();
//                 }
//             } catch (paymentError) {
//                 console.log('Error fetching payment status before update:', paymentError.message);
//             }
//         }

//         // If cancelling order, process refund automatically
//         if (status === 'Cancelled' && order.status !== 'Cancelled') {
//             const refundResult = await processAutomaticRefund(order, cancelReason);
//             if (refundResult.success) {
//                 order.refundInfo = refundResult.refundInfo;
//             }
//         }

//         // Update order status
//         const updateData = {
//             status: status,
//             ...(status === 'Cancelled' && {
//                 cancelReason: cancelReason || 'Cancelled by admin',
//                 cancelledBy: 'admin',
//                 cancelledAt: new Date()
//             })
//         };

//         const updatedOrder = await Order.findByIdAndUpdate(
//             orderId,
//             { $set: updateData },
//             { new: true }
//         );

//         logger.info("Order status updated successfully", { orderId, status });

//         res.status(200).json({
//             message: "Order status updated",
//             order: updatedOrder,
//             refundProcessed: status === 'Cancelled' ? true : false
//         });
//     } catch (error) {
//         logger.error("Error updating order status", { error: error.message, stack: error.stack });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Function to process automatic refund
// async function processAutomaticRefund(order, cancelReason) {
//     try {
//         // Check if payment exists and is captured or authorized
//         if (!order.paymentInfo?.paymentId) {
//             return { success: false, reason: 'Payment ID missing' };
//         }

//         if (!['captured', 'authorized'].includes(order.paymentInfo?.status)) {
//             return { success: false, reason: 'Payment not captured or authorized' };
//         }

//         // If payment is authorized but not captured, we need to capture first then refund
//         if (order.paymentInfo.status === 'authorized') {
//             try {
//                 await razorpayInstance.payments.capture(
//                     order.paymentInfo.paymentId,
//                     order.totalAmount * 100,
//                     "INR"
//                 );
//                 logger.info("Payment captured for refund", { orderId: order._id });
//             } catch (captureError) {
//                 logger.error("Failed to capture payment for refund", { error: captureError.message });
//                 return { success: false, reason: 'Failed to capture payment before refund' };
//             }
//         }

//         // Create refund with Razorpay
//         const refundData = {
//             amount: order.totalAmount * 100, // Full refund in paise
//             speed: 'optimum', // Can be 'normal' or 'optimum'
//             notes: {
//                 reason: cancelReason || 'Order cancelled by admin',
//                 orderId: order._id.toString()
//             },
//             receipt: `refund_${order._id}_${Date.now()}`
//         };

//         const refund = await razorpayInstance.payments.refund(order.paymentInfo.paymentId, refundData);

//         // Calculate estimated settlement date (typically 5-7 business days for optimum, 7-10 for normal)
//         const estimatedDays = refundData.speed === 'optimum' ? 5 : 7;
//         const estimatedSettlement = new Date();
//         estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

//         const refundInfo = {
//             refundId: refund.id,
//             amount: refund.amount / 100,
//             status: refund.status,
//             speed: refund.speed_processed || refundData.speed,
//             reason: cancelReason || 'Order cancelled by admin',
//             createdAt: new Date(refund.created_at * 1000),
//             estimatedSettlement,
//             notes: `Refund processed automatically due to order cancellation. Expected settlement in ${estimatedDays} business days.`
//         };

//         logger.info("Automatic refund processed", {
//             orderId: order._id,
//             refundId: refund.id,
//             amount: refund.amount / 100
//         });

//         return { success: true, refundInfo };

//     } catch (error) {
//         logger.error("Error processing automatic refund", {
//             orderId: order._id,
//             error: error.message
//         });
//         return { success: false, reason: error.message };
//     }
// }

// // New route to manually process refund (for admin)
// router.post('/orders/:orderId/refund', async (req, res) => {
//     const { orderId } = req.params;
//     const { amount, reason, speed = 'optimum' } = req.body;

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.paymentInfo?.paymentId) {
//             return res.status(400).json({ message: "Payment ID missing" });
//         }

//         if (!['captured', 'authorized'].includes(order.paymentInfo?.status)) {
//             return res.status(400).json({ message: "Payment not captured or authorized" });
//         }

//         // If payment is authorized, capture it first
//         if (order.paymentInfo.status === 'authorized') {
//             try {
//                 await razorpayInstance.payments.capture(
//                     order.paymentInfo.paymentId,
//                     order.totalAmount * 100,
//                     "INR"
//                 );
//             } catch (captureError) {
//                 return res.status(400).json({ message: "Failed to capture payment before refund" });
//             }
//         }

//         const refundAmount = amount || order.totalAmount;
//         const refundData = {
//             amount: refundAmount * 100,
//             speed,
//             notes: {
//                 reason: reason || 'Manual refund by admin',
//                 orderId: order._id.toString()
//             },
//             receipt: `refund_${order._id}_${Date.now()}`
//         };

//         const refund = await razorpayInstance.payments.refund(order.paymentInfo.paymentId, refundData);

//         const estimatedDays = speed === 'optimum' ? 5 : 7;
//         const estimatedSettlement = new Date();
//         estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

//         const refundInfo = {
//             refundId: refund.id,
//             amount: refund.amount / 100,
//             status: refund.status,
//             speed: refund.speed_processed || speed,
//             reason: reason || 'Manual refund by admin',
//             createdAt: new Date(refund.created_at * 1000),
//             estimatedSettlement,
//             notes: `Manual refund processed. Expected settlement in ${estimatedDays} business days.`
//         };

//         // Update order with refund info
//         order.refundInfo = refundInfo;
//         order.status = 'Cancelled';
//         await order.save();

//         logger.info("Manual refund processed", {
//             orderId,
//             refundId: refund.id,
//             amount: refund.amount / 100
//         });

//         res.status(200).json({
//             message: "Refund processed successfully",
//             refund: refundInfo
//         });

//     } catch (error) {
//         logger.error("Error processing manual refund", { orderId, error: error.message });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Get refund status for a specific order
// router.get('/orders/:orderId/refund-status', async (req, res) => {
//     const { orderId } = req.params;

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.refundInfo?.refundId) {
//             return res.status(200).json({
//                 message: "No refund found for this order",
//                 refundInfo: null
//             });
//         }

//         // Fetch latest refund details from Razorpay
//         const refund = await razorpayInstance.refunds.fetch(order.refundInfo.refundId);

//         // Update refund info with latest data
//         order.refundInfo = {
//             ...order.refundInfo.toObject(),
//             status: refund.status,
//             processedAt: refund.processed_at ? new Date(refund.processed_at * 1000) : null,
//             notes: order.refundInfo.notes
//         };
//         await order.save();

//         res.status(200).json({
//             refundInfo: order.refundInfo,
//             razorpayRefundDetails: refund
//         });

//     } catch (error) {
//         logger.error("Error fetching refund status", { orderId, error: error.message });
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Test route to check if payment route is working
// router.get('/test-payment-route', (req, res) => {
//     res.json({ message: "Payment route is working" });
// });

// // Test route for updatePayment
// router.get('/test-update-payment', (req, res) => {
//     res.json({ message: "Update payment route is working" });
// });

// router.get('/', (req, res) => {
//     res.send("API Working");
// });



// module.exports = router;


// //3:
// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order');
// const { logger } = require("../utils/logger");
// const Razorpay = require('razorpay');
// const nodemailer = require('nodemailer');

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// // Rate limiting for live API calls (to stay within free limits)
// const rateLimiter = {
//     calls: [],
//     maxCallsPerHour: 1800, // Stay under 2000 limit

//     canMakeCall() {
//         const now = Date.now();
//         const oneHourAgo = now - 3600000;

//         // Remove calls older than 1 hour
//         this.calls = this.calls.filter(time => time > oneHourAgo);

//         if (this.calls.length >= this.maxCallsPerHour) {
//             logger.warn('Rate limit reached for Razorpay API calls');
//             return false;
//         }

//         this.calls.push(now);
//         return true;
//     },

//     getRemainingCalls() {
//         const now = Date.now();
//         const oneHourAgo = now - 3600000;
//         this.calls = this.calls.filter(time => time > oneHourAgo);
//         return this.maxCallsPerHour - this.calls.length;
//     }
// };

// // Email function 
// const sendOrderEmail = async (toEmail, orderData) => {
//     const recipients = [toEmail];

//     // Also send to company email if it's different from user email
//     if (toEmail !== process.env.EMAIL_USERNAME) {
//         recipients.push(process.env.EMAIL_USERNAME);
//     }

//     const { items, totalAmount, _id: orderId, address, phone, createdAt } = orderData;

//     // Format date
//     const orderDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });

//     // Calculate subtotal and format items
//     const itemsHTML = items.map((item, index) => `
//         <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 15px 10px; vertical-align: top;">
//                 <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${item.name}</div>
//                 <div style="font-size: 13px; color: #666;">Quantity: ${item.quantity}</div>
//             </td>
//             <td style="padding: 15px 10px; text-align: right; vertical-align: top; font-weight: 600; color: #333;">
//                 ₹${item.price.toLocaleString('en-IN')}
//             </td>
//         </tr>
//     `).join('');

//     const mailOptions = {
//         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
//         to: recipients.join(', '),
//         subject: `Order Confirmed - #${orderId}`,
//         html: `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Order Confirmation</title>
// </head>
// <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
//         <tr>
//             <td align="center">
//                 <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">

//                     <!-- Header -->
//                     <tr>
//                         <td style="background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); padding: 30px; text-align: center;">
//                             <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Chauhan Sons Jewellers</h1>
//                             <p style="margin: 8px 0 0 0; color: #f0d4b0; font-size: 14px; letter-spacing: 1px;">FINE JEWELRY SINCE 1969</p>
//                         </td>
//                     </tr>

//                     <!-- Success Message -->
//                     <tr>
//                         <td style="padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #7d2a25;">
//                             <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 20px;">
//                                 <span style="color: #2e7d32; font-size: 32px;">✓</span>
//                             </div>
//                             <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
//                             <p style="margin: 0; color: #666; font-size: 15px;">Thank you for your purchase. Your order has been received and is being processed.</p>
//                         </td>
//                     </tr>

//                     <!-- Order Info -->
//                     <tr>
//                         <td style="padding: 30px;">
//                             <table width="100%" cellpadding="0" cellspacing="0">
//                                 <tr>
//                                     <td style="padding-bottom: 20px;">
//                                         <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px;">
//                                             <tr>
//                                                 <td style="width: 50%; padding: 10px;">
//                                                     <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Number</div>
//                                                     <div style="font-size: 16px; color: #333; font-weight: 600;">#${orderId}</div>
//                                                 </td>
//                                                 <td style="width: 50%; padding: 10px; text-align: right;">
//                                                     <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Date</div>
//                                                     <div style="font-size: 16px; color: #333; font-weight: 600;">${orderDate}</div>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- Order Items -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
//                                 <thead>
//                                     <tr style="background-color: #f9f9f9;">
//                                         <th style="padding: 15px 10px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Item</th>
//                                         <th style="padding: 15px 10px; text-align: right; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Price</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${itemsHTML}
//                                 </tbody>
//                             </table>

//                             <!-- Order Summary -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
//                                 <tr>
//                                     <td style="padding: 15px 0; border-top: 2px solid #eee;">
//                                         <table width="100%" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="padding: 8px 0; color: #666; font-size: 15px;">Subtotal</td>
//                                                 <td style="padding: 8px 0; text-align: right; color: #333; font-size: 15px; font-weight: 500;">₹${totalAmount.toLocaleString('en-IN')}</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 8px 0; color: #666; font-size: 15px;">Shipping</td>
//                                                 <td style="padding: 8px 0; text-align: right; color: #2e7d32; font-size: 15px; font-weight: 600;">FREE</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 15px 0 0 0; color: #333; font-size: 18px; font-weight: 700; border-top: 2px solid #7d2a25;">Order Total</td>
//                                                 <td style="padding: 15px 0 0 0; text-align: right; color: #7d2a25; font-size: 20px; font-weight: 700; border-top: 2px solid #7d2a25;">₹${totalAmount.toLocaleString('en-IN')}</td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- Delivery Info -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td>
//                                         <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #7d2a25;">
//                                             <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Delivery Address</h3>
//                                             <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.6;">${address}</p>
//                                             <p style="margin: 0; color: #666; font-size: 14px;">
//                                                 <strong style="color: #333;">Contact:</strong> ${phone}
//                                             </p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- What's Next -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td>
//                                         <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">What happens next?</h3>
//                                         <table width="100%" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top; width: 30px;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     We'll send you a shipping confirmation email with tracking details
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     Your order will be carefully packaged and shipped
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="padding: 12px 0; vertical-align: top;">
//                                                     <div style="background-color: #7d2a25; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</div>
//                                                 </td>
//                                                 <td style="padding: 12px 0; color: #666; font-size: 14px; line-height: 1.6;">
//                                                     Enjoy your beautiful jewelry from Chauhan Sons!
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>

//                             <!-- CTA Button -->
//                             <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
//                                 <tr>
//                                     <td align="center">
//                                         <a href="https://chauhansonsjewellers.com" style="display: inline-block; background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">View Order Status</a>
//                                     </td>
//                                 </tr>
//                             </table>

//                         </td>
//                     </tr>

//                     <!-- Footer -->
//                     <tr>
//                         <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
//                             <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Need help with your order?</p>
//                             <p style="margin: 0 0 15px 0;">
//                                 <a href="mailto:chauhansons69@yahoo.com" style="color: #7d2a25; text-decoration: none; font-weight: 600;">Contact Customer Support</a>
//                             </p>
//                             <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #ddd;">
//                                 <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">Chauhan Sons Jewellers</p>
//                                 <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} All rights reserved</p>
//                             </div>
//                         </td>
//                     </tr>

//                 </table>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
//         `,
//     };

//     return transporter.sendMail(mailOptions);
// };

// // ============================================
// // 1. CREATE ORDER
// // ============================================
// router.post('/createOrder', async (req, res) => {
//     const { userId, items, address, phone, totalAmount, email } = req.body;

//     if (!userId || !items?.length || !address || !phone || !totalAmount || !email) {
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     try {
//         const razorpayOrder = await razorpay.orders.create({
//             amount: totalAmount * 100,
//             currency: "INR",
//             receipt: `order_${Date.now()}`,
//             payment_capture: 1,
//         });

//         const newOrder = new Order({
//             userId,
//             items,
//             address,
//             phone,
//             totalAmount,
//             razorpayOrderId: razorpayOrder.id,
//             status: 'Pending',
//             paymentInfo: {
//                 status: 'created',
//                 amount: totalAmount,
//                 updatedAt: new Date(),
//             },
//         });

//         await newOrder.save();

//         sendOrderEmail(email, newOrder).catch(err =>
//             logger.error("Email failed:", err.message)
//         );

//         res.status(201).json({
//             message: "Order created successfully",
//             orderId: newOrder._id,
//             razorpayOrderId: razorpayOrder.id,
//             razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//         });
//     } catch (error) {
//         logger.error("Order creation failed:", error);
//         res.status(500).json({ message: "Failed to create order", error: error.message });
//     }
// });

// // ============================================
// // 2. GET USER ORDERS (Fast - From Database)
// // ============================================
// router.get('/orders/user/:userId', async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const orders = await Order.find({ userId })
//             .sort({ createdAt: -1 })
//             .select('-__v');

//         res.status(200).json({
//             orders,
//             source: 'database',
//             message: 'Data from webhooks. Click refresh for live status.',
//             totalCount: orders.length
//         });
//     } catch (error) {
//         logger.error("Error fetching user orders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // ============================================
// // 3. GET ALL ORDERS - Admin (Fast - From Database)
// // ============================================
// router.get('/orders', async (req, res) => {
//     try {
//         const orders = await Order.find()
//             .sort({ createdAt: -1 })
//             .select('-__v');

//         res.status(200).json({
//             orders,
//             source: 'database',
//             message: 'Data from webhooks. Click refresh for live status.',
//             totalCount: orders.length
//         });
//     } catch (error) {
//         logger.error("Error fetching all orders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // ============================================
// // 4. SYNC SINGLE ORDER WITH RAZORPAY (On-demand)
// // ============================================
// // //1:
// // router.post('/orders/:orderId/sync', async (req, res) => {
// //     const { orderId } = req.params;

// //     // Check rate limit
// //     if (!rateLimiter.canMakeCall()) {
// //         return res.status(429).json({
// //             message: "Rate limit reached. Please try again later.",
// //             remainingCalls: rateLimiter.getRemainingCalls()
// //         });
// //     }

// //     try {
// //         const order = await Order.findById(orderId);
// //         if (!order) {
// //             return res.status(404).json({ message: "Order not found" });
// //         }

// //         const syncResult = {
// //             orderId: order._id,
// //             previousStatus: {
// //                 order: order.status,
// //                 payment: order.paymentInfo?.status,
// //                 refund: order.refundInfo?.status
// //             },
// //             updated: false,
// //             changes: []
// //         };

// //         // 1. Sync Payment Status
// //         if (order.razorpayOrderId) {
// //             try {
// //                 const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);

// //                 if (payments.items && payments.items.length > 0) {
// //                     const latestPayment = payments.items[0];

// //                     // Update only if status changed
// //                     if (order.paymentInfo?.status !== latestPayment.status) {
// //                         order.paymentInfo = {
// //                             paymentId: latestPayment.id,
// //                             amount: latestPayment.amount / 100,
// //                             status: latestPayment.status,
// //                             method: latestPayment.method,
// //                             updatedAt: new Date()
// //                         };
// //                         syncResult.updated = true;
// //                         syncResult.changes.push('payment_status_updated');
// //                     }

// //                     // 2. Sync Refund Status (if payment is captured)
// //                     if (latestPayment.status === 'captured' && order.refundInfo?.refundId) {
// //                         try {
// //                             const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);

// //                             if (order.refundInfo.status !== refund.status) {
// //                                 order.refundInfo.status = refund.status;

// //                                 if (refund.status === 'processed') {
// //                                     order.refundInfo.processedAt = new Date();
// //                                     order.status = 'Refunded';
// //                                     syncResult.changes.push('refund_processed');
// //                                 }

// //                                 syncResult.updated = true;
// //                                 syncResult.changes.push('refund_status_updated');
// //                             }
// //                         } catch (refundError) {
// //                             logger.error('Failed to sync refund:', refundError.message);
// //                         }
// //                     }
// //                 }
// //             } catch (paymentError) {
// //                 logger.error('Failed to sync payment:', paymentError.message);
// //                 return res.status(500).json({
// //                     message: "Failed to sync with Razorpay",
// //                     error: paymentError.message
// //                 });
// //             }
// //         }

// //         if (syncResult.updated) {
// //             await order.save();
// //         }

// //         syncResult.currentStatus = {
// //             order: order.status,
// //             payment: order.paymentInfo?.status,
// //             refund: order.refundInfo?.status
// //         };

// //         res.status(200).json({
// //             message: syncResult.updated ? "Order synced with Razorpay" : "Order already up to date",
// //             ...syncResult,
// //             remainingApiCalls: rateLimiter.getRemainingCalls()
// //         });

// //     } catch (error) {
// //         logger.error("Error syncing order:", error);
// //         res.status(500).json({ message: "Sync failed", error: error.message });
// //     }
// // });

// // //2:
// router.post('/orders/:orderId/sync', async (req, res) => {
//     const { orderId } = req.params;

//     console.log('=== DEBUG: Syncing order:', orderId);

//     try {
//         const order = await Order.findById(orderId);

//         if (!order) {
//             console.log('ERROR: Order not found:', orderId);
//             return res.status(404).json({ message: "Order not found" });
//         }

//         console.log('Order found:', {
//             orderId: order._id,
//             razorpayOrderId: order.razorpayOrderId,
//             currentPaymentStatus: order.paymentInfo?.status,
//             currentRefundStatus: order.refundInfo?.status
//         });

//         const syncResult = {
//             orderId: order._id,
//             previousStatus: {
//                 order: order.status,
//                 payment: order.paymentInfo?.status,
//                 refund: order.refundInfo?.status
//             },
//             updated: false,
//             changes: []
//         };

//         // Sync Payment Status
//         if (order.razorpayOrderId) {
//             try {
//                 console.log('Fetching payments from Razorpay...');
//                 const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);

//                 console.log('Razorpay response:', {
//                     count: payments.items?.length || 0,
//                     payments: payments.items?.map(p => ({
//                         id: p.id,
//                         status: p.status,
//                         amount: p.amount
//                     }))
//                 });

//                 if (payments.items && payments.items.length > 0) {
//                     const latestPayment = payments.items[0];

//                     // Update only if status changed
//                     if (order.paymentInfo?.status !== latestPayment.status) {
//                         order.paymentInfo = {
//                             paymentId: latestPayment.id,
//                             amount: latestPayment.amount / 100,
//                             status: latestPayment.status,
//                             method: latestPayment.method,
//                             updatedAt: new Date()
//                         };
//                         syncResult.updated = true;
//                         syncResult.changes.push('payment_status_updated');
//                         console.log('Payment status updated:', latestPayment.status);
//                     }

//                     // Sync Refund Status
//                     if (latestPayment.status === 'captured' && order.refundInfo?.refundId) {
//                         try {
//                             console.log('Fetching refund:', order.refundInfo.refundId);
//                             const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);

//                             console.log('Refund status from Razorpay:', refund.status);

//                             if (order.refundInfo.status !== refund.status) {
//                                 order.refundInfo.status = refund.status;

//                                 if (refund.status === 'processed') {
//                                     order.refundInfo.processedAt = new Date();
//                                     order.status = 'Refunded';
//                                     syncResult.changes.push('refund_processed');
//                                 }

//                                 syncResult.updated = true;
//                                 syncResult.changes.push('refund_status_updated');
//                             }
//                         } catch (refundError) {
//                             console.error('Failed to fetch refund:', refundError.message);
//                         }
//                     }
//                 } else {
//                     console.log('No payments found for this order');
//                 }
//             } catch (paymentError) {
//                 console.error('Razorpay API Error:', paymentError);
//                 return res.status(500).json({
//                     message: "Failed to sync with Razorpay",
//                     error: paymentError.message,
//                     details: paymentError.error || {}
//                 });
//             }
//         } else {
//             console.log('No razorpayOrderId found for this order');
//         }

//         if (syncResult.updated) {
//             await order.save();
//             console.log('Order updated successfully');
//         }

//         syncResult.currentStatus = {
//             order: order.status,
//             payment: order.paymentInfo?.status,
//             refund: order.refundInfo?.status
//         };

//         res.status(200).json({
//             message: syncResult.updated ? "Order synced with Razorpay" : "Order already up to date",
//             ...syncResult
//         });

//     } catch (error) {
//         console.error("ERROR syncing order:", error);
//         logger.error("Error syncing order:", error);
//         res.status(500).json({
//             message: "Sync failed",
//             error: error.message,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// });

// // ============================================
// // DEBUG ROUTE: Check if orders exist
// // ============================================
// router.get('/debug/orders', async (req, res) => {
//     try {
//         const allOrders = await Order.find().limit(10).lean();
//         const totalCount = await Order.countDocuments();

//         res.status(200).json({
//             totalOrders: totalCount,
//             sampleOrders: allOrders.map(order => ({
//                 _id: order._id,
//                 userId: order.userId,
//                 userIdType: typeof order.userId,
//                 totalAmount: order.totalAmount,
//                 status: order.status,
//                 paymentStatus: order.paymentInfo?.status,
//                 razorpayOrderId: order.razorpayOrderId,
//                 createdAt: order.createdAt
//             }))
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // ============================================
// // 5. BULK SYNC ORDERS (Admin - Use sparingly)
// // ============================================
// router.post('/orders/sync-all', async (req, res) => {
//     const { limit = 10 } = req.body; // Limit to prevent rate limit issues

//     try {
//         // Get orders that might need syncing
//         const orders = await Order.find({
//             $or: [
//                 { 'paymentInfo.status': { $in: ['created', 'authorized'] } },
//                 { 'refundInfo.status': 'pending' }
//             ]
//         })
//             .limit(limit)
//             .sort({ updatedAt: -1 });

//         const syncResults = [];

//         for (const order of orders) {
//             if (!rateLimiter.canMakeCall()) {
//                 logger.warn('Rate limit reached during bulk sync');
//                 break;
//             }

//             try {
//                 const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);

//                 if (payments.items && payments.items.length > 0) {
//                     const latestPayment = payments.items[0];

//                     if (order.paymentInfo?.status !== latestPayment.status) {
//                         order.paymentInfo = {
//                             paymentId: latestPayment.id,
//                             amount: latestPayment.amount / 100,
//                             status: latestPayment.status,
//                             method: latestPayment.method,
//                             updatedAt: new Date()
//                         };
//                         await order.save();
//                         syncResults.push({ orderId: order._id, updated: true });
//                     }
//                 }
//             } catch (error) {
//                 logger.error(`Failed to sync order ${order._id}:`, error.message);
//                 syncResults.push({ orderId: order._id, error: error.message });
//             }
//         }

//         res.status(200).json({
//             message: `Synced ${syncResults.length} orders`,
//             results: syncResults,
//             remainingApiCalls: rateLimiter.getRemainingCalls()
//         });

//     } catch (error) {
//         logger.error("Bulk sync failed:", error);
//         res.status(500).json({ message: "Bulk sync failed", error: error.message });
//     }
// });

// // ============================================
// // 6. UPDATE ORDER STATUS (Auto-refund)
// // ============================================
// router.put('/orders/:orderId/status', async (req, res) => {
//     const { orderId } = req.params;
//     const { status, cancelReason } = req.body;

//     if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
//         return res.status(400).json({ message: "Invalid status" });
//     }

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // If cancelling and payment is captured, process refund
//         if (status === 'Cancelled' &&
//             order.status !== 'Cancelled' &&
//             order.paymentInfo?.status === 'captured' &&
//             order.paymentInfo?.paymentId) {

//             // Check rate limit before refund
//             if (!rateLimiter.canMakeCall()) {
//                 return res.status(429).json({
//                     message: "Rate limit reached. Please try again later."
//                 });
//             }

//             try {
//                 const refund = await razorpay.payments.refund(
//                     order.paymentInfo.paymentId,
//                     {
//                         amount: order.totalAmount * 100,
//                         speed: 'optimum',
//                         notes: {
//                             reason: cancelReason || 'Cancelled by admin',
//                             orderId: order._id.toString()
//                         }
//                     }
//                 );

//                 order.refundInfo = {
//                     refundId: refund.id,
//                     amount: refund.amount / 100,
//                     status: refund.status,
//                     speed: 'optimum',
//                     reason: cancelReason || 'Cancelled by admin',
//                     createdAt: new Date(refund.created_at * 1000),
//                     notes: `Refund initiated. Expected settlement in 5-7 business days.`
//                 };

//                 logger.info("Refund processed:", { orderId, refundId: refund.id });
//             } catch (refundError) {
//                 logger.error("Refund failed:", refundError);
//                 return res.status(500).json({
//                     message: "Failed to process refund",
//                     error: refundError.message
//                 });
//             }
//         }

//         order.status = status;
//         if (status === 'Cancelled') {
//             order.cancelReason = cancelReason || 'Cancelled by admin';
//             order.cancelledBy = 'admin';
//             order.cancelledAt = new Date();
//         }

//         await order.save();

//         res.status(200).json({
//             message: "Order status updated successfully",
//             order,
//             remainingApiCalls: rateLimiter.getRemainingCalls()
//         });
//     } catch (error) {
//         logger.error("Error updating order status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // ============================================
// // 7. GET API USAGE STATS
// // ============================================
// router.get('/api-stats', (req, res) => {
//     res.status(200).json({
//         remainingCalls: rateLimiter.getRemainingCalls(),
//         maxCallsPerHour: rateLimiter.maxCallsPerHour,
//         currentCalls: rateLimiter.calls.length,
//         message: 'API calls are limited to stay within free tier'
//     });
// });

// module.exports = router;


// // 4:
// const express = require('express');
// const router = express.Router();
// const Order = require('../models/order');
// const { logger } = require("../utils/logger");
// const Razorpay = require('razorpay');
// const nodemailer = require('nodemailer');

// // Initialize Razorpay
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const transporter = nodemailer.createTransporter({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// // Email sending function (keep your existing one)
// const sendOrderEmail = async (toEmail, orderData) => {
//     // Your existing email code - keep it as is
//     const recipients = [toEmail];
//     if (toEmail !== process.env.EMAIL_USERNAME) {
//         recipients.push(process.env.EMAIL_USERNAME);
//     }

//     const { items, totalAmount, _id: orderId, address, phone, createdAt } = orderData;
//     const orderDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });

//     const itemsHTML = items.map((item) => `
//         <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 15px 10px; vertical-align: top;">
//                 <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${item.name}</div>
//                 <div style="font-size: 13px; color: #666;">Quantity: ${item.quantity}</div>
//             </td>
//             <td style="padding: 15px 10px; text-align: right; vertical-align: top; font-weight: 600; color: #333;">
//                 ₹${item.price.toLocaleString('en-IN')}
//             </td>
//         </tr>
//     `).join('');

//     const mailOptions = {
//         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
//         to: recipients.join(', '),
//         subject: `Order Confirmed - #${orderId}`,
//         html: `<!-- Your existing email HTML -->
//         <!DOCTYPE html>
//         <html>
//         <body>
//             <h1>Order Confirmed</h1>
//             <p>Order #${orderId}</p>
//             <p>Date: ${orderDate}</p>
//             ${itemsHTML}
//             <p>Total: ₹${totalAmount}</p>
//         </body>
//         </html>
//         `
//     };

//     return transporter.sendMail(mailOptions);
// };

// // ============================================
// // CRITICAL: SPECIFIC ROUTES FIRST!
// // Routes are matched in ORDER - most specific MUST come first
// // ============================================

// // 1. CREATE ORDER
// router.post('/createOrder', async (req, res) => {
//     const { userId, items, address, phone, totalAmount, email } = req.body;

//     console.log('Creating order for userId:', userId);

//     if (!userId || !items?.length || !address || !phone || !totalAmount || !email) {
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     try {
//         const razorpayOrder = await razorpay.orders.create({
//             amount: totalAmount * 100,
//             currency: "INR",
//             receipt: `order_${Date.now()}`,
//             payment_capture: 1,
//         });

//         const newOrder = new Order({
//             userId,
//             items,
//             address,
//             phone,
//             totalAmount,
//             razorpayOrderId: razorpayOrder.id,
//             status: 'Pending',
//             paymentInfo: {
//                 status: 'created',
//                 amount: totalAmount,
//                 updatedAt: new Date(),
//             },
//         });

//         await newOrder.save();

//         sendOrderEmail(email, newOrder).catch(err =>
//             logger.error("Email failed:", err.message)
//         );

//         res.status(201).json({
//             message: "Order created successfully",
//             orderId: newOrder._id,
//             razorpayOrderId: razorpayOrder.id,
//             razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//         });
//     } catch (error) {
//         logger.error("Order creation failed:", error);
//         res.status(500).json({ message: "Failed to create order", error: error.message });
//     }
// });

// // 2. GET USER ORDERS - SPECIFIC ROUTE (MUST BE BEFORE /:orderId)
// router.get('/orders/user/:userId', async (req, res) => {
//     const { userId } = req.params;

//     console.log('Fetching orders for userId:', userId);

//     try {
//         const orders = await Order.find({ userId })
//             .sort({ createdAt: -1 })
//             .lean();

//         console.log(`Found ${orders.length} orders for user ${userId}`);

//         res.status(200).json({
//             orders,
//             totalCount: orders.length,
//             source: 'database'
//         });
//     } catch (error) {
//         console.error("Error fetching user orders:", error);
//         logger.error("Error fetching user orders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 3. GET REFUND STATUS - SPECIFIC ROUTE (MUST BE BEFORE /:orderId)
// router.get('/orders/:orderId/refund-status', async (req, res) => {
//     const { orderId } = req.params;

//     console.log('Fetching refund status for orderId:', orderId);

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.refundInfo?.refundId) {
//             return res.status(200).json({
//                 message: "No refund found",
//                 refundInfo: null
//             });
//         }

//         // Try to fetch live refund status from Razorpay
//         try {
//             const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);

//             // Update if status changed
//             if (order.refundInfo.status !== refund.status) {
//                 order.refundInfo.status = refund.status;

//                 if (refund.status === 'processed') {
//                     order.refundInfo.processedAt = new Date();
//                     order.status = 'Refunded';
//                 }

//                 await order.save();
//             }

//             res.status(200).json({
//                 refundInfo: order.refundInfo,
//                 liveStatus: refund.status
//             });
//         } catch (rzpError) {
//             console.log('Could not fetch live refund status:', rzpError.message);
//             // Return cached status
//             res.status(200).json({
//                 refundInfo: order.refundInfo,
//                 liveStatus: order.refundInfo.status,
//                 note: "Using cached status"
//             });
//         }
//     } catch (error) {
//         logger.error("Error fetching refund status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 4. UPDATE ORDER STATUS - SPECIFIC ROUTE (MUST BE BEFORE /:orderId)
// router.put('/orders/:orderId/status', async (req, res) => {
//     const { orderId } = req.params;
//     const { status, cancelReason } = req.body;

//     console.log('Updating order status:', { orderId, status, cancelReason });

//     if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
//         return res.status(400).json({ message: "Invalid status" });
//     }

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // Process refund ONLY if:
//         // 1. Cancelling order
//         // 2. Order not already cancelled
//         // 3. Payment was captured
//         // 4. No refund already initiated
//         if (status === 'Cancelled' &&
//             order.status !== 'Cancelled' &&
//             order.paymentInfo?.status === 'captured' &&
//             order.paymentInfo?.paymentId &&
//             !order.refundInfo?.refundId) {

//             try {
//                 console.log('Processing refund for order:', orderId);

//                 const refund = await razorpay.payments.refund(
//                     order.paymentInfo.paymentId,
//                     {
//                         amount: order.totalAmount * 100,
//                         speed: 'optimum',
//                         notes: {
//                             reason: cancelReason || 'Cancelled by admin',
//                             orderId: order._id.toString()
//                         }
//                     }
//                 );

//                 const estimatedSettlement = new Date();
//                 estimatedSettlement.setDate(estimatedSettlement.getDate() + 7);

//                 order.refundInfo = {
//                     refundId: refund.id,
//                     amount: refund.amount / 100,
//                     status: refund.status,
//                     speed: 'optimum',
//                     reason: cancelReason || 'Cancelled by admin',
//                     createdAt: new Date(refund.created_at * 1000),
//                     estimatedSettlement,
//                     notes: `Refund initiated. Expected settlement in 5-7 business days.`
//                 };

//                 console.log('Refund processed successfully:', refund.id);
//             } catch (refundError) {
//                 console.error('Refund failed:', refundError);
//                 logger.error("Refund error:", refundError);
//                 // Continue with cancellation even if refund fails
//             }
//         }

//         // Update order status
//         order.status = status;
//         if (status === 'Cancelled') {
//             order.cancelReason = cancelReason || 'Cancelled by admin';
//             order.cancelledBy = 'admin';
//             order.cancelledAt = new Date();
//         }

//         await order.save();

//         res.status(200).json({
//             message: "Order status updated successfully",
//             order,
//             refundProcessed: order.refundInfo?.refundId ? true : false
//         });
//     } catch (error) {
//         console.error("Error updating order status:", error);
//         logger.error("Error updating order status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 5. MANUAL REFUND - SPECIFIC ROUTE (MUST BE BEFORE /:orderId)
// router.post('/orders/:orderId/refund', async (req, res) => {
//     const { orderId } = req.params;
//     const { amount, reason } = req.body;

//     console.log('Processing manual refund for order:', orderId);

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.paymentInfo?.paymentId) {
//             return res.status(400).json({ message: "No payment found" });
//         }

//         if (order.refundInfo?.refundId) {
//             return res.status(400).json({ message: "Refund already processed" });
//         }

//         const refundAmount = amount || order.totalAmount;

//         const refund = await razorpay.payments.refund(
//             order.paymentInfo.paymentId,
//             {
//                 amount: refundAmount * 100,
//                 speed: 'optimum',
//                 notes: { reason: reason || 'Manual refund by admin' }
//             }
//         );

//         const estimatedSettlement = new Date();
//         estimatedSettlement.setDate(estimatedSettlement.getDate() + 7);

//         order.refundInfo = {
//             refundId: refund.id,
//             amount: refund.amount / 100,
//             status: refund.status,
//             speed: 'optimum',
//             reason: reason || 'Manual refund by admin',
//             createdAt: new Date(refund.created_at * 1000),
//             estimatedSettlement,
//             notes: `Manual refund processed.`
//         };

//         order.status = 'Cancelled';
//         await order.save();

//         console.log('Manual refund processed:', refund.id);

//         res.status(200).json({
//             message: "Refund processed successfully",
//             refund: order.refundInfo
//         });
//     } catch (error) {
//         console.error("Manual refund failed:", error);
//         logger.error("Manual refund error:", error);
//         res.status(500).json({
//             message: "Refund failed",
//             error: error.message
//         });
//     }
// });

// // 6. GET ALL ORDERS (Admin) - MUST BE BEFORE /:orderId
// router.get('/orders', async (req, res) => {
//     console.log('Fetching all orders (admin)');

//     try {
//         const orders = await Order.find()
//             .sort({ createdAt: -1 })
//             .lean();

//         console.log(`Found ${orders.length} total orders`);

//         res.status(200).json({
//             orders,
//             totalCount: orders.length
//         });
//     } catch (error) {
//         console.error("Error fetching all orders:", error);
//         logger.error("Error fetching all orders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 7. GET SINGLE ORDER BY ID - GENERIC ROUTE (MUST BE LAST)
// router.get('/orders/:orderId', async (req, res) => {
//     const { orderId } = req.params;

//     console.log('Fetching single order:', orderId);

//     try {
//         const order = await Order.findById(orderId).lean();

//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         res.status(200).json({
//             order,
//             source: 'database'
//         });
//     } catch (error) {
//         console.error("Error fetching order:", error);
//         logger.error("Error fetching order:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // 8. PAYMENT STATUS (for backward compatibility)
// router.get('/paymentStatus/:orderId', async (req, res) => {
//     const { orderId } = req.params;

//     console.log('Fetching payment status for order:', orderId);

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         res.status(200).json({
//             paymentInfo: order.paymentInfo || {
//                 status: 'unknown',
//                 amount: order.totalAmount
//             },
//             refundInfo: order.refundInfo || null
//         });
//     } catch (error) {
//         console.error("Error fetching payment status:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// // Health check
// router.get('/test-payment-route', (req, res) => {
//     res.json({
//         message: "Payment route is working",
//         timestamp: new Date().toISOString()
//     });
// });

// module.exports = router;


// // 6:
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { logger } = require("../utils/logger");
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const sendOrderEmail = async (toEmail, orderData) => {
    const recipients = [toEmail];
    if (toEmail !== process.env.EMAIL_USERNAME) {
        recipients.push(process.env.EMAIL_USERNAME);
    }

    const { items, totalAmount, _id: orderId, address, phone, createdAt } = orderData;
    const orderDate = new Date(createdAt || Date.now()).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const itemsHTML = items.map((item) => `
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
        <body>
            <h1>Order Confirmed</h1>
            <p>Order #${orderId}</p>
            <p>Date: ${orderDate}</p>
            <table>${itemsHTML}</table>
            <p><strong>Total: ₹${totalAmount}</strong></p>
        </body>
        </html>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Fetch live payment status from Razorpay
const fetchLivePaymentStatus = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            status: payment.status,
            method: payment.method,
            amount: payment.amount / 100,
            captured: payment.captured,
            updatedAt: new Date(payment.created_at * 1000)
        };
    } catch (error) {
        logger.error('Failed to fetch live payment status:', error);
        return null;
    }
};

// Fetch live refund status from Razorpay
const fetchLiveRefundStatus = async (refundId) => {
    try {
        const refund = await razorpay.refunds.fetch(refundId);
        return {
            status: refund.status,
            amount: refund.amount / 100,
            speedProcessed: refund.speed_processed,
            updatedAt: new Date()
        };
    } catch (error) {
        logger.error('Failed to fetch live refund status:', error);
        return null;
    }
};

// ============================================
// ROUTES - ORDERED FROM MOST TO LEAST SPECIFIC
// ============================================

// 0. HEALTH CHECK - Most specific path
router.get('/test-payment-route', (req, res) => {
    res.json({
        message: "Payment route is working",
        timestamp: new Date().toISOString(),
        razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    });
});

// 1. CREATE ORDER
router.post('/createOrder', async (req, res) => {
    const { userId, items, address, phone, totalAmount, email } = req.body;

    console.log('📦 Creating order for userId:', userId);

    if (!userId || !items?.length || !address || !phone || !totalAmount || !email) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Create Razorpay order with AUTOMATIC capture enabled
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `order_${Date.now()}`,
            payment_capture: 1, // Auto-capture enabled (1 = automatic, 0 = manual)
            notes: {
                userId: userId,
                email: email
            }
        });

        const newOrder = new Order({
            userId,
            items,
            address,
            phone,
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
            status: 'Pending',
            paymentInfo: {
                status: 'created',
                amount: totalAmount,
                updatedAt: new Date(),
            },
        });

        await newOrder.save();

        // Send email asynchronously
        sendOrderEmail(email, newOrder).catch(err =>
            logger.error("Email failed:", err.message)
        );

        console.log('✅ Order created:', newOrder._id);

        res.status(201).json({
            message: "Order created successfully",
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        logger.error("Order creation failed:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
});

// 2. CAPTURE PAYMENT MANUALLY (if needed for authorized payments)
router.post('/capturePayment/:orderId', async (req, res) => {
    const { orderId } = req.params;

    console.log('💳 Manual capture requested for order:', orderId);

    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({ message: "No payment ID found" });
        }

        if (order.paymentInfo.status !== 'authorized') {
            return res.status(400).json({ 
                message: `Payment cannot be captured. Current status: ${order.paymentInfo.status}` 
            });
        }

        // Capture the authorized payment
        const payment = await razorpay.payments.capture(
            order.paymentInfo.paymentId,
            order.totalAmount * 100,
            "INR"
        );

        // Update order with captured payment info
        order.paymentInfo = {
            paymentId: payment.id,
            amount: payment.amount / 100,
            status: 'captured',
            method: payment.method,
            updatedAt: new Date(),
            captured: true
        };

        order.paymentCompleted = true;
        order.paymentCompletedAt = new Date();

        await order.save();

        console.log('✅ Payment captured successfully:', payment.id);

        res.status(200).json({
            message: "Payment captured successfully",
            paymentInfo: order.paymentInfo
        });

    } catch (error) {
        console.error('❌ Payment capture failed:', error);
        logger.error("Payment capture error:", error);
        res.status(500).json({ 
            message: "Failed to capture payment", 
            error: error.error?.description || error.message 
        });
    }
});

// 3. GET USER ORDERS WITH LIVE STATUS - SPECIFIC before /:orderId
router.get('/user/:userId/orders', async (req, res) => {
    const { userId } = req.params;
    const { includeLiveStatus } = req.query;

    console.log('📋 Fetching orders for userId:', userId);

    try {
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // If live status requested, fetch from Razorpay
        if (includeLiveStatus === 'true') {
            for (let order of orders) {
                // Update payment status if paymentId exists
                if (order.paymentInfo?.paymentId) {
                    const livePayment = await fetchLivePaymentStatus(order.paymentInfo.paymentId);
                    if (livePayment) {
                        order.paymentInfo.liveStatus = livePayment.status;
                        order.paymentInfo.captured = livePayment.captured;
                    }
                }

                // Update refund status if refundId exists
                if (order.refundInfo?.refundId) {
                    const liveRefund = await fetchLiveRefundStatus(order.refundInfo.refundId);
                    if (liveRefund) {
                        order.refundInfo.liveStatus = liveRefund.status;
                    }
                }
            }
        }

        console.log(`✅ Found ${orders.length} orders for user ${userId}`);

        res.status(200).json({
            orders,
            totalCount: orders.length,
            source: includeLiveStatus === 'true' ? 'live' : 'database'
        });
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        logger.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 4. GET ALL ORDERS (Admin) WITH LIVE STATUS - Before /:orderId
router.get('/admin/orders', async (req, res) => {
    const { includeLiveStatus } = req.query;

    console.log('👨‍💼 Fetching all orders (admin)');

    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .lean();

        // Optionally fetch live status
        if (includeLiveStatus === 'true') {
            for (let order of orders) {
                if (order.paymentInfo?.paymentId) {
                    const livePayment = await fetchLivePaymentStatus(order.paymentInfo.paymentId);
                    if (livePayment) {
                        order.paymentInfo.liveStatus = livePayment.status;
                    }
                }

                if (order.refundInfo?.refundId) {
                    const liveRefund = await fetchLiveRefundStatus(order.refundInfo.refundId);
                    if (liveRefund) {
                        order.refundInfo.liveStatus = liveRefund.status;
                    }
                }
            }
        }

        console.log(`✅ Found ${orders.length} total orders`);

        res.status(200).json({
            orders,
            totalCount: orders.length,
            source: includeLiveStatus === 'true' ? 'live' : 'database'
        });
    } catch (error) {
        console.error("❌ Error fetching all orders:", error);
        logger.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 5. GET REFUND STATUS WITH LIVE SYNC - SPECIFIC before /:orderId
router.get('/:orderId/refund-status', async (req, res) => {
    const { orderId } = req.params;

    console.log('🔄 Fetching refund status for orderId:', orderId);

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.refundInfo?.refundId) {
            return res.status(200).json({
                message: "No refund found",
                refundInfo: null
            });
        }

        // Fetch live status from Razorpay
        try {
            const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);

            // Update if status changed
            if (order.refundInfo.status !== refund.status) {
                order.refundInfo.status = refund.status;

                if (refund.status === 'processed') {
                    order.refundInfo.processedAt = new Date();
                    order.status = 'Refunded';
                }

                await order.save();
                console.log('✅ Refund status updated:', refund.status);
            }

            res.status(200).json({
                refundInfo: order.refundInfo,
                liveStatus: refund.status,
                source: 'razorpay'
            });
        } catch (rzpError) {
            console.log('⚠️ Could not fetch live refund status:', rzpError.message);
            // Return cached status
            res.status(200).json({
                refundInfo: order.refundInfo,
                liveStatus: order.refundInfo.status,
                source: 'cache',
                note: "Using cached status - Razorpay API unavailable"
            });
        }
    } catch (error) {
        logger.error("Error fetching refund status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 6. UPDATE ORDER STATUS WITH AUTO-REFUND - SPECIFIC before /:orderId
router.put('/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status, cancelReason } = req.body;

    console.log('📝 Updating order status:', { orderId, status, cancelReason });

    if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        let refundProcessed = false;

        // AUTO-REFUND LOGIC: Process refund ONLY if cancelling a captured payment
        if (status === 'Cancelled' &&
            order.status !== 'Cancelled' &&
            order.paymentInfo?.status === 'captured' &&
            order.paymentInfo?.paymentId &&
            !order.refundInfo?.refundId) {

            try {
                console.log('🔄 Processing automatic refund for order:', orderId);

                const refund = await razorpay.payments.refund(
                    order.paymentInfo.paymentId,
                    {
                        amount: order.totalAmount * 100,
                        speed: 'optimum', // Options: normal, optimum
                        notes: {
                            reason: cancelReason || 'Cancelled by admin',
                            orderId: order._id.toString()
                        }
                    }
                );

                const estimatedDays = 5; // Optimum speed typically 5-7 days
                const estimatedSettlement = new Date();
                estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

                order.refundInfo = {
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                    speed: 'optimum',
                    reason: cancelReason || 'Cancelled by admin',
                    createdAt: new Date(refund.created_at * 1000),
                    estimatedSettlement,
                    notes: `Automatic refund initiated. Expected settlement in ${estimatedDays} business days.`
                };

                refundProcessed = true;
                console.log('✅ Refund processed successfully:', refund.id);
            } catch (refundError) {
                console.error('❌ Refund failed:', refundError);
                logger.error("Refund error:", refundError);
                // Continue with cancellation even if refund fails
                order.refundInfo = {
                    status: 'failed',
                    reason: cancelReason || 'Cancelled by admin',
                    error: refundError.error?.description || refundError.message,
                    notes: 'Automatic refund failed - manual intervention required'
                };
            }
        }

        // Update order status
        order.status = status;
        if (status === 'Cancelled') {
            order.cancelReason = cancelReason || 'Cancelled by admin';
            order.cancelledBy = 'admin';
            order.cancelledAt = new Date();
        }

        await order.save();

        console.log('✅ Order status updated:', { orderId, status, refundProcessed });

        res.status(200).json({
            message: "Order status updated successfully",
            order,
            refundProcessed,
            refundInfo: order.refundInfo || null
        });
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        logger.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 7. MANUAL REFUND ENDPOINT - SPECIFIC before /:orderId
router.post('/:orderId/refund', async (req, res) => {
    const { orderId } = req.params;
    const { amount, reason, speed = 'optimum' } = req.body;

    console.log('💰 Processing manual refund for order:', orderId);

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({ message: "No payment found to refund" });
        }

        if (order.paymentInfo.status !== 'captured') {
            return res.status(400).json({ 
                message: `Payment not captured. Current status: ${order.paymentInfo.status}` 
            });
        }

        if (order.refundInfo?.refundId) {
            return res.status(400).json({ 
                message: "Refund already processed",
                existingRefund: order.refundInfo
            });
        }

        const refundAmount = amount || order.totalAmount;

        const refund = await razorpay.payments.refund(
            order.paymentInfo.paymentId,
            {
                amount: refundAmount * 100,
                speed: speed, // 'normal' or 'optimum'
                notes: { 
                    reason: reason || 'Manual refund by admin',
                    orderId: order._id.toString()
                }
            }
        );

        const estimatedDays = speed === 'optimum' ? 5 : 7;
        const estimatedSettlement = new Date();
        estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

        order.refundInfo = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            speed: speed,
            reason: reason || 'Manual refund by admin',
            createdAt: new Date(refund.created_at * 1000),
            estimatedSettlement,
            notes: `Manual refund processed. Expected settlement in ${estimatedDays} business days.`
        };

        if (order.status !== 'Cancelled') {
            order.status = 'Cancelled';
            order.cancelReason = reason || 'Manual refund by admin';
            order.cancelledBy = 'admin';
            order.cancelledAt = new Date();
        }

        await order.save();

        console.log('✅ Manual refund processed:', refund.id);

        res.status(200).json({
            message: "Refund processed successfully",
            refund: order.refundInfo,
            order: {
                _id: order._id,
                status: order.status,
                totalAmount: order.totalAmount
            }
        });
    } catch (error) {
        console.error("❌ Manual refund failed:", error);
        logger.error("Manual refund error:", error);
        res.status(500).json({
            message: "Refund failed",
            error: error.error?.description || error.message
        });
    }
});

// 8. PAYMENT STATUS (backward compatibility)
router.get('/paymentStatus/:orderId', async (req, res) => {
    const { orderId } = req.params;

    console.log('💳 Fetching payment status for order:', orderId);

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Optionally fetch live status
        let livePaymentStatus = null;
        if (order.paymentInfo?.paymentId) {
            livePaymentStatus = await fetchLivePaymentStatus(order.paymentInfo.paymentId);
        }

        res.status(200).json({
            paymentInfo: order.paymentInfo || {
                status: 'unknown',
                amount: order.totalAmount
            },
            livePaymentStatus,
            refundInfo: order.refundInfo || null
        });
    } catch (error) {
        console.error("❌ Error fetching payment status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 9. GET SINGLE ORDER BY ID - GENERIC (MUST BE LAST)
router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;

    console.log('🔍 Fetching single order:', orderId);

    try {
        const order = await Order.findById(orderId).lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch live statuses
        if (order.paymentInfo?.paymentId) {
            const livePayment = await fetchLivePaymentStatus(order.paymentInfo.paymentId);
            if (livePayment) {
                order.paymentInfo.liveStatus = livePayment.status;
            }
        }

        if (order.refundInfo?.refundId) {
            const liveRefund = await fetchLiveRefundStatus(order.refundInfo.refundId);
            if (liveRefund) {
                order.refundInfo.liveStatus = liveRefund.status;
            }
        }

        console.log('✅ Order fetched:', orderId);

        res.status(200).json({
            order,
            source: 'database_with_live_sync'
        });
    } catch (error) {
        console.error("❌ Error fetching order:", error);
        logger.error("Error fetching order:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;