// // models/Order.js
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
//       name: String,
//       quantity: { type: Number, default: 1 },
//       price: Number,
//     }
//   ],
//   address: { type: String, required: true },
//   phone: { type: String, required: true },
//   totalAmount: { type: Number, required: true },
//   status: { type: String, default: 'Pending' },
//   paymentId: String,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Order', orderSchema);


// // 2:
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
//       name: String,
//       quantity: { type: Number, default: 1 },
//       price: Number,
//     }
//   ],
//   address: { type: String, required: true },
//   phone: { type: String, required: true },
//   totalAmount: { type: Number, required: true },

//   // Razorpay integration fields
//   razorpayOrderId: { type: String },
//   paymentInfo: {
//     paymentId: { type: String },
//     amount: { type: Number },
//     status: { type: String }, // 'captured', 'failed', 'refunded', 'authorized'
//     updatedAt: { type: Date }
//   },

//   // Enhanced refund tracking
//   refundInfo: {
//     refundId: { type: String }, // Razorpay refund ID
//     amount: { type: Number }, // Refund amount
//     status: { type: String }, // 'processed', 'failed', 'pending'
//     speed: { type: String }, // 'normal', 'optimum'
//     reason: { type: String }, // Refund reason
//     createdAt: { type: Date },
//     processedAt: { type: Date },
//     estimatedSettlement: { type: Date }, // When refund will reach customer
//     notes: { type: String }
//   },

//   status: { type: String, default: 'Pending' }, // 'Pending', 'Delivered', 'Cancelled', 'Refunded'
//   cancelReason: { type: String }, // Reason for cancellation
//   cancelledBy: { type: String }, // 'admin', 'user', 'system'
//   cancelledAt: { type: Date },

//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Order', orderSchema);


// // 3:
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
//       name: { type: String, required: true },
//       quantity: { type: Number, default: 1, min: 1 },
//       price: { type: Number, required: true, min: 0 },
//       _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
//     }
//   ],
//   address: { type: String, required: true, trim: true },
//   phone: { type: String, required: true, trim: true },
//   totalAmount: { type: Number, required: true, min: 0 },

//   // Razorpay integration fields
//   razorpayOrderId: {
//     type: String,
//     sparse: true, // Allows multiple null values but unique non-null values
//     // index: true 
//   },

//   // Enhanced payment tracking
//   paymentInfo: {
//     paymentId: { type: String, sparse: true }, // Razorpay payment ID
//     amount: { type: Number, min: 0 }, // Payment amount
//     status: {
//       type: String,
//       enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'unknown'],
//       default: 'created'
//     },
//     method: { type: String }, // Payment method (card, netbanking, upi, etc.)
//     updatedAt: { type: Date, default: Date.now },
//     razorpayCreatedAt: { type: Date }, // When payment was created in Razorpay

//     // Additional payment details for debugging/tracking
//     fee: { type: Number, default: 0 }, // Payment processing fee
//     tax: { type: Number, default: 0 }, // Tax on fee
//     acquirerData: {
//       type: mongoose.Schema.Types.Mixed, // Bank reference number, etc.
//       default: {}
//     }
//   },

//   // Enhanced refund tracking
//   refundInfo: {
//     refundId: { type: String, sparse: true }, // Razorpay refund ID
//     amount: { type: Number, min: 0 }, // Refund amount
//     status: {
//       type: String,
//       enum: ['created', 'pending', 'processed', 'failed'],
//       default: 'created'
//     },
//     speed: {
//       type: String,
//       enum: ['normal', 'optimum'],
//       default: 'normal'
//     }, // Refund processing speed
//     reason: { type: String, trim: true }, // Refund reason
//     createdAt: { type: Date }, // When refund was initiated
//     processedAt: { type: Date }, // When refund was processed
//     failedAt: { type: Date }, // When refund failed (if applicable)
//     estimatedSettlement: { type: Date }, // Expected settlement date
//     notes: { type: String, trim: true }, // Additional notes about refund

//     // Additional refund tracking
//     batchId: { type: String }, // Razorpay batch ID for bulk refunds
//     receiptNumber: { type: String }, // Refund receipt number
//     errorCode: { type: String }, // Error code if refund failed
//     errorDescription: { type: String, trim: true } // Error description if failed
//   },

//   // Order status and lifecycle
//   status: {
//     type: String,
//     enum: ['Pending', 'Delivered', 'Cancelled', 'Refunded'],
//     default: 'Pending'
//   },

//   // Cancellation tracking
//   cancelReason: { type: String, trim: true }, // Reason for cancellation
//   cancelledBy: {
//     type: String,
//     enum: ['admin', 'user', 'system'],
//     sparse: true
//   }, // Who cancelled the order
//   cancelledAt: { type: Date }, // When order was cancelled

//   // Payment completion tracking (for webhook processing)
//   paymentCompleted: { type: Boolean, default: false },
//   paymentCompletedAt: { type: Date },

//   // Order timestamps
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },

//   // Delivery tracking (optional - for future use)
//   deliveryInfo: {
//     trackingNumber: { type: String, sparse: true },
//     courier: { type: String, trim: true },
//     estimatedDelivery: { type: Date },
//     deliveredAt: { type: Date },
//     deliveryNotes: { type: String, trim: true }
//   }
// }, {
//   // Schema options
//   timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, // Automatic timestamps
//   toJSON: { virtuals: true }, // Include virtuals in JSON output
//   toObject: { virtuals: true }
// });

// // Indexes for better query performance
// orderSchema.index({ userId: 1, createdAt: -1 }); // User orders by date
// orderSchema.index({ razorpayOrderId: 1 }, { sparse: true }); // Razorpay order lookup
// orderSchema.index({ 'paymentInfo.paymentId': 1 }, { sparse: true }); // Payment lookup
// orderSchema.index({ 'refundInfo.refundId': 1 }, { sparse: true }); // Refund lookup
// orderSchema.index({ status: 1, createdAt: -1 }); // Status-based queries
// orderSchema.index({ createdAt: -1 }); // Recent orders

// // Virtual for order total with items calculation (validation)
// orderSchema.virtual('calculatedTotal').get(function () {
//   return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
// });

// // Virtual for order age in days
// orderSchema.virtual('ageInDays').get(function () {
//   return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
// });

// // Virtual for payment status label
// orderSchema.virtual('paymentStatusLabel').get(function () {
//   if (!this.paymentInfo || !this.paymentInfo.status) return 'Unknown';

//   switch (this.paymentInfo.status.toLowerCase()) {
//     case 'captured': return 'Paid';
//     case 'authorized': return 'Authorized (Pending)';
//     case 'failed': return 'Failed';
//     case 'created': return 'Payment Initiated';
//     default: return this.paymentInfo.status.charAt(0).toUpperCase() + this.paymentInfo.status.slice(1);
//   }
// });

// // Pre-save middleware to validate total amount
// orderSchema.pre('save', function (next) {
//   // Validate that totalAmount matches sum of items
//   const calculatedTotal = this.items.reduce((total, item) => {
//     if (!item.price || !item.quantity || item.price < 0 || item.quantity < 1) {
//       return next(new Error('Invalid item price or quantity'));
//     }
//     return total + (item.price * item.quantity);
//   }, 0);

//   if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) { // Allow for floating point precision
//     return next(new Error(`Total amount mismatch: expected ${calculatedTotal}, got ${this.totalAmount}`));
//   }

//   // Update timestamps
//   this.updatedAt = new Date();

//   // Auto-set payment completion if status changes to captured
//   if (this.paymentInfo && this.paymentInfo.status === 'captured' && !this.paymentCompleted) {
//     this.paymentCompleted = true;
//     this.paymentCompletedAt = new Date();
//   }

//   next();
// });

// // Pre-save middleware to handle status transitions
// orderSchema.pre('save', function (next) {
//   if (this.isModified('status')) {
//     const now = new Date();

//     // Auto-set cancellation timestamp
//     if (this.status === 'Cancelled' && !this.cancelledAt) {
//       this.cancelledAt = now;
//       if (!this.cancelledBy) {
//         this.cancelledBy = 'system'; // Default if not specified
//       }
//     }

//     // Clear cancellation data if status changes from Cancelled
//     if (this.status !== 'Cancelled' && this.isModified('status') && this.cancelledAt) {
//       this.cancelReason = undefined;
//       this.cancelledBy = undefined;
//       this.cancelledAt = undefined;
//     }
//   }

//   next();
// });

// // Static method to find orders with payment issues
// orderSchema.statics.findPaymentIssues = function () {
//   return this.find({
//     $or: [
//       { 'paymentInfo.status': 'failed' },
//       { 'paymentInfo.status': 'authorized', createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Authorized for over 24 hours
//       { status: 'Pending', paymentInfo: { $exists: false } }, // No payment info
//       { status: 'Pending', 'paymentInfo.status': { $in: [null, 'unknown'] } } // Unknown payment status
//     ]
//   });
// };

// // Static method to find orders needing refund processing
// orderSchema.statics.findRefundPending = function () {
//   return this.find({
//     status: 'Cancelled',
//     'paymentInfo.status': 'captured',
//     $or: [
//       { refundInfo: { $exists: false } },
//       { 'refundInfo.refundId': { $exists: false } }
//     ]
//   });
// };

// // Instance method to check if order can be cancelled
// orderSchema.methods.canBeCancelled = function () {
//   return this.status === 'Pending' || this.status === 'Delivered';
// };

// // Instance method to check if refund is possible
// orderSchema.methods.canBeRefunded = function () {
//   return this.paymentInfo &&
//     ['captured', 'authorized'].includes(this.paymentInfo.status) &&
//     (!this.refundInfo || !this.refundInfo.refundId);
// };

// // Instance method to get estimated refund settlement date
// orderSchema.methods.getEstimatedRefundSettlement = function () {
//   if (!this.refundInfo || !this.refundInfo.estimatedSettlement) return null;

//   const now = new Date();
//   const settlement = new Date(this.refundInfo.estimatedSettlement);
//   const diffTime = settlement - now;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//   if (diffDays <= 0) return 'Should be settled';
//   if (diffDays === 1) return 'Expected tomorrow';
//   return `Expected in ${diffDays} days`;
// };

// module.exports = mongoose.model('Order', orderSchema);


// // 5:
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { logger } = require("../utils/logger");
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

// Initialize Razorpay with auto-capture enabled
const razorpay = new Razorpay({
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

// Email sending function 
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
                    <tr>
                        <td style="background: linear-gradient(135deg, #7d2a25 0%, #5a1f1a 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Chauhan Sons Jewellers</h1>
                            <p style="margin: 8px 0 0 0; color: #f0d4b0; font-size: 14px; letter-spacing: 1px;">FINE JEWELRY SINCE 1969</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #7d2a25;">
                            <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 20px;">
                                <span style="color: #2e7d32; font-size: 32px;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
                            <p style="margin: 0; color: #666; font-size: 15px;">Thank you for your purchase. Your order has been received and is being processed.</p>
                        </td>
                    </tr>
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
                        </td>
                    </tr>
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

// ============================================
// IMPORTANT: SPECIFIC ROUTES MUST COME FIRST!
// ============================================

// 1. CREATE ORDER
router.post('/createOrder', async (req, res) => {
    const { userId, items, address, phone, totalAmount, email } = req.body;

    if (!userId || !items?.length || !address || !phone || !totalAmount || !email) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Create Razorpay Order with auto-capture
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `order_${Date.now()}`,
            payment_capture: 1, // Auto-capture enabled
        });

        // Create order in DB
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

        // Send confirmation email (non-blocking)
        sendOrderEmail(email, newOrder).catch(err => 
            logger.error("Email failed:", err.message)
        );

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

// 2. GET ALL ORDERS (Admin) - MUST BE BEFORE /orders/:orderId
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({ 
            orders,
            totalCount: orders.length 
        });
    } catch (error) {
        logger.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 3. GET USER ORDERS - MUST BE BEFORE /orders/:orderId
router.get('/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            orders,
            totalCount: orders.length
        });
    } catch (error) {
        logger.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 4. GET REFUND STATUS - MUST BE BEFORE /orders/:orderId
router.get('/orders/:orderId/refund-status', async (req, res) => {
    const { orderId } = req.params;

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

        // Fetch live refund status from Razorpay
        try {
            const refund = await razorpay.refunds.fetch(order.refundInfo.refundId);
            
            // Update local refund info
            order.refundInfo.status = refund.status;
            if (refund.status === 'processed') {
                order.refundInfo.processedAt = new Date();
                order.status = 'Refunded';
            }
            await order.save();

            res.status(200).json({
                refundInfo: order.refundInfo,
                liveStatus: refund.status
            });
        } catch (rzpError) {
            // Return cached refund info if API fails
            res.status(200).json({
                refundInfo: order.refundInfo,
                liveStatus: order.refundInfo.status,
                note: "Using cached status"
            });
        }
    } catch (error) {
        logger.error("Error fetching refund status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 5. GET SINGLE ORDER STATUS - MUST BE BEFORE /orders/:orderId/status
router.get('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            orderId: order._id,
            status: order.status,
            paymentInfo: order.paymentInfo,
            refundInfo: order.refundInfo,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
        });
    } catch (error) {
        logger.error("Error fetching order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 6. UPDATE ORDER STATUS (Admin Only)
router.put('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status, cancelReason } = req.body;

    // Validate status
    if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ONLY process refund if admin is explicitly cancelling AND payment was captured
        if (status === 'Cancelled' && 
            order.status !== 'Cancelled' && 
            order.paymentInfo?.status === 'captured' &&
            order.paymentInfo?.paymentId &&
            !order.refundInfo?.refundId) { // Don't refund twice
            
            try {
                logger.info("Processing refund for cancelled order:", { orderId, paymentId: order.paymentInfo.paymentId });
                
                // Process refund
                const refund = await razorpay.payments.refund(
                    order.paymentInfo.paymentId,
                    {
                        amount: order.totalAmount * 100,
                        speed: 'optimum',
                        notes: {
                            reason: cancelReason || 'Cancelled by admin',
                            orderId: order._id.toString()
                        }
                    }
                );

                // Calculate estimated settlement (5-7 business days)
                const estimatedSettlement = new Date();
                estimatedSettlement.setDate(estimatedSettlement.getDate() + 7);

                // Update order with refund info
                order.refundInfo = {
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                    speed: refund.speed_processed || 'optimum',
                    reason: cancelReason || 'Cancelled by admin',
                    createdAt: new Date(refund.created_at * 1000),
                    estimatedSettlement: estimatedSettlement,
                    notes: `Refund initiated. Expected settlement in 5-7 business days.`
                };

                logger.info("Refund processed successfully:", { orderId, refundId: refund.id });
            } catch (refundError) {
                logger.error("Refund failed:", refundError);
                // Continue with cancellation even if refund fails
                // Admin can manually process refund later
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

        res.status(200).json({
            message: "Order status updated successfully",
            order,
            refundProcessed: status === 'Cancelled' && order.refundInfo?.refundId ? true : false
        });
    } catch (error) {
        logger.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 7. MANUAL REFUND (Admin Only) - For edge cases
router.post('/orders/:orderId/refund', async (req, res) => {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.paymentInfo?.paymentId) {
            return res.status(400).json({ message: "No payment found for this order" });
        }

        if (order.refundInfo?.refundId) {
            return res.status(400).json({ message: "Refund already processed for this order" });
        }

        const refundAmount = amount || order.totalAmount;
        
        logger.info("Processing manual refund:", { orderId, refundAmount });
        
        const refund = await razorpay.payments.refund(
            order.paymentInfo.paymentId,
            {
                amount: refundAmount * 100,
                speed: 'optimum',
                notes: { reason: reason || 'Manual refund by admin' }
            }
        );

        const estimatedSettlement = new Date();
        estimatedSettlement.setDate(estimatedSettlement.getDate() + 7);

        order.refundInfo = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            speed: 'optimum',
            reason: reason || 'Manual refund by admin',
            createdAt: new Date(refund.created_at * 1000),
            estimatedSettlement: estimatedSettlement,
            notes: `Manual refund processed by admin.`
        };
        order.status = 'Cancelled';
        await order.save();

        logger.info("Manual refund processed successfully:", { orderId, refundId: refund.id });

        res.status(200).json({
            message: "Refund processed successfully",
            refund: order.refundInfo
        });
    } catch (error) {
        logger.error("Manual refund failed:", error);
        res.status(500).json({ 
            message: "Refund failed", 
            error: error.message,
            details: error.error?.description || error.description
        });
    }
});

module.exports = router;
