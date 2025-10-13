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



// // final:
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Admin = require('../models/admin');
const { logger } = require("../utils/logger");
const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Create Order Route
router.post('/createOrder', async (req, res) => {
    const { userId, items, address, phone, totalAmount } = req.body;

    console.log("=== CREATE ORDER REQUEST ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));

    try {
        // Comprehensive validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

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

        // Fetch user details
        console.log("Fetching user with ID:", userId);
        const user = await Admin.findById(userId);
        if (!user) {
            console.error("User not found:", userId);
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("User found:", {
            id: user._id,
            email: user.email,
            name: user.name
        });

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

        // Prepare phone number (ensure it starts with +91 and has 10 digits)
        let formattedPhone = phone.toString().trim();
        // Remove any existing country code
        formattedPhone = formattedPhone.replace(/^\+91/, '').replace(/^91/, '');
        // Validate 10 digits
        if (!/^\d{10}$/.test(formattedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits"
            });
        }
        formattedPhone = `+91${formattedPhone}`;

        console.log("Formatted phone:", formattedPhone);

        // Check if razorpayInstance is properly initialized
        if (!razorpayInstance) {
            console.error("Razorpay instance not initialized!");
            return res.status(500).json({
                success: false,
                message: "Payment gateway configuration error. Please contact support.",
                error: "Razorpay not initialized"
            });
        }

        // Verify Razorpay credentials are set
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay credentials missing in environment variables");
            return res.status(500).json({
                success: false,
                message: "Payment gateway configuration error. Please contact support.",
                error: "Missing Razorpay credentials"
            });
        }

        console.log("Razorpay credentials present:", {
            keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
            keySecretPresent: !!process.env.RAZORPAY_KEY_SECRET
        });

        // Create Razorpay Order with minimal required fields
        console.log("Creating Razorpay order...");
        const amountInPaise = Math.round(totalAmount * 100);
        
        const razorpayOrderData = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `order_${Date.now()}_${userId.toString().slice(-6)}`,
            notes: {
                userId: userId.toString(),
                phone: formattedPhone,
                itemCount: items.length.toString()
            }
        };

        console.log("Razorpay order request:", JSON.stringify(razorpayOrderData, null, 2));

        let razorpayOrder;
        try {
            razorpayOrder = await razorpayInstance.orders.create(razorpayOrderData);
            console.log("Razorpay order created successfully:", {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                status: razorpayOrder.status
            });
        } catch (razorpayError) {
            console.error("=== RAZORPAY ERROR ===");
            console.error("Error type:", razorpayError.constructor.name);
            console.error("Error message:", razorpayError.message);
            console.error("Error details:", JSON.stringify(razorpayError, null, 2));
            
            // Extract detailed error info
            let errorDetails = "Unknown error";
            if (razorpayError.error) {
                errorDetails = JSON.stringify(razorpayError.error);
            } else if (razorpayError.description) {
                errorDetails = razorpayError.description;
            } else if (razorpayError.message) {
                errorDetails = razorpayError.message;
            }
            
            console.error("Extracted error details:", errorDetails);
            
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
            userId: userId,
            userEmail: user.email || '',
            userName: user.name || 'Customer',
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
        } catch (dbError) {
            console.error("=== DATABASE ERROR ===");
            console.error("Error name:", dbError.name);
            console.error("Error message:", dbError.message);
            console.error("Error details:", JSON.stringify(dbError, null, 2));

            // Handle specific database errors
            if (dbError.name === 'ValidationError') {
                const validationErrors = Object.values(dbError.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    message: "Order validation failed: " + validationErrors.join(', '),
                    razorpayOrderId: razorpayOrder.id
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
                razorpayOrderId: razorpayOrder.id
            });
        }

        // Log success
        if (typeof logger !== 'undefined' && logger && typeof logger.info === 'function') {
            logger.info("Order created successfully", {
                orderId: savedOrder._id,
                razorpayOrderId: razorpayOrder.id,
                userId,
                totalAmount
            });
        }

        console.log("=== ORDER CREATION SUCCESS ===");

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
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Request data:", { 
            userId, 
            itemsCount: items?.length, 
            totalAmount,
            address: address?.substring(0, 50) + '...'
        });

        // Log the error if logger is available
        if (typeof logger !== 'undefined' && logger && typeof logger.error === 'function') {
            logger.error("Order creation failed", {
                error: error.message,
                stack: error.stack,
                userId,
                totalAmount,
                itemsCount: items?.length
            });
        }

        // Handle different types of errors
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
            error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
});

// Update Order Status with GUARANTEED Refund Processing
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

        // Process refund when admin cancels AND payment is captured
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            console.log("Order being cancelled - checking refund eligibility...");

            // Check if payment exists and is captured
            if (order.paymentInfo?.paymentId && order.paymentInfo?.status === 'captured') {
                console.log("Payment captured - processing refund");
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

                    console.log("Refund API success:");
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

                    console.log("Refund info updated in order");

                    logger.info("Refund initiated successfully", {
                        orderId: order._id,
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        paymentId: order.paymentInfo.paymentId
                    });

                } catch (refundError) {
                    console.error("Refund API failed:");
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

                    console.log("Refund failed but order will still be cancelled");
                }
            } else {
                console.log("No refund needed - payment not captured");
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
        console.log("Order saved successfully");

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

        // Fetch live data from Razorpay if order exists
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
                                // Order is cancelled but no refund exists
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
            .populate('userId', 'name email phone')
            .lean();

        res.status(200).json({
            success: true,
            orders: orders,
            totalCount: orders.length
        });

    } catch (error) {
        console.error("Error fetching all orders:", error);
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

        // If refund exists, fetch latest status from Razorpay
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

// Capture Payment
router.post('/capturePayment/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({
                success: false,
                message: "No payment found for this order"
            });
        }

        if (order.paymentInfo.status !== 'authorized') {
            return res.status(400).json({
                success: false,
                message: "Payment is not in authorized state"
            });
        }

        // Capture the payment
        const capturedPayment = await razorpayInstance.payments.capture(
            order.paymentInfo.paymentId,
            Math.round(order.totalAmount * 100),
            'INR'
        );

        // Update order
        order.paymentInfo.status = 'captured';
        order.paymentInfo.capturedAt = new Date();
        order.paymentInfo.updatedAt = new Date();

        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment captured successfully",
            paymentInfo: order.paymentInfo
        });

    } catch (error) {
        console.error("Error capturing payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to capture payment",
            error: error.message
        });
    }
});

// Get order count
router.get('/totalOrdercount', async (req, res) => {
    try {
        const count = await Order.countDocuments();
        res.status(200).json({
            success: true,
            totalOrders: count
        });
    } catch (error) {
        console.error("Error getting order count:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get order count"
        });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "Order routes working!",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
