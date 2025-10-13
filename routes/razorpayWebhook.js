// // // const express = require('express');
// // // const router = express.Router();
// // // const crypto = require('crypto');
// // // const Order = require('../models/order');
// // // const { logger } = require('../utils/logger');

// // // const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// // // router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
// // //   const webhookSignature = req.headers['x-razorpay-signature'];

// // //   // Verify webhook signature
// // //   const expectedSignature = crypto
// // //     .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
// // //     .update(req.body, 'utf-8')
// // //     .digest('hex');

// // //   if (expectedSignature !== webhookSignature) {
// // //     logger.error('Invalid webhook signature', { 
// // //       expected: expectedSignature, 
// // //       received: webhookSignature 
// // //     });
// // //     return res.status(400).send('Invalid signature');
// // //   }

// // //   const payload = JSON.parse(req.body.toString());
// // //   const { event, payload: eventData } = payload;

// // //   logger.info('Webhook received', { event, paymentId: eventData.payment?.entity?.id });

// // //   try {
// // //     // Handle Payment Events
// // //     if (['payment.captured', 'payment.failed', 'payment.authorized'].includes(event)) {
// // //       await handlePaymentWebhook(event, eventData);
// // //     }

// // //     // Handle Refund Events
// // //     if (['refund.created', 'refund.processed', 'refund.speed_changed'].includes(event)) {
// // //       await handleRefundWebhook(event, eventData);
// // //     }

// // //     res.status(200).send('Webhook received');
// // //   } catch (error) {
// // //     logger.error('Webhook processing error', { 
// // //       event, 
// // //       error: error.message, 
// // //       stack: error.stack 
// // //     });
// // //     res.status(500).send('Internal server error');
// // //   }
// // // });

// // // async function handlePaymentWebhook(event, eventData) {
// // //   const paymentEntity = eventData.payment.entity;
// // //   const paymentId = paymentEntity.id;
// // //   const orderId = paymentEntity.order_id;

// // //   logger.info('Processing payment webhook', { event, paymentId, orderId });

// // //   // Find order by razorpayOrderId
// // //   const order = await Order.findOne({ razorpayOrderId: orderId });

// // //   if (!order) {
// // //     logger.warn('Order not found for payment webhook', { orderId });
// // //     return;
// // //   }

// // //   // Update payment info based on event
// // //   let paymentStatus = '';
// // //   switch (event) {
// // //     case 'payment.captured':
// // //       paymentStatus = 'captured';
// // //       break;
// // //     case 'payment.failed':
// // //       paymentStatus = 'failed';
// // //       break;
// // //     case 'payment.authorized':
// // //       paymentStatus = 'authorized';
// // //       break;
// // //   }

// // //   order.paymentInfo = {
// // //     paymentId,
// // //     amount: paymentEntity.amount / 100, // Convert from paise to rupees
// // //     status: paymentStatus,
// // //     method: paymentEntity.method,
// // //     updatedAt: new Date(paymentEntity.created_at * 1000),
// // //   };

// // //   // Update order status if payment failed
// // //   if (event === 'payment.failed') {
// // //     order.status = 'Cancelled';
// // //     order.cancelReason = 'Payment failed';
// // //     order.cancelledBy = 'system';
// // //     order.cancelledAt = new Date();
// // //   }

// // //   await order.save();

// // //   logger.info('Payment webhook processed successfully', { 
// // //     orderId: order._id, 
// // //     paymentStatus 
// // //   });
// // // }

// // // async function handleRefundWebhook(event, eventData) {
// // //   const refundEntity = eventData.refund.entity;
// // //   const refundId = refundEntity.id;
// // //   const paymentId = refundEntity.payment_id;

// // //   logger.info('Processing refund webhook', { event, refundId, paymentId });

// // //   // Find order by payment ID
// // //   const order = await Order.findOne({ 'paymentInfo.paymentId': paymentId });

// // //   if (!order) {
// // //     logger.warn('Order not found for refund webhook', { paymentId });
// // //     return;
// // //   }

// // //   // Calculate estimated settlement date based on refund speed
// // //   const estimatedDays = refundEntity.speed_processed === 'optimum' ? 5 : 7;
// // //   const estimatedSettlement = new Date();
// // //   estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

// // //   // Update refund info based on event
// // //   switch (event) {
// // //     case 'refund.created':
// // //       order.refundInfo = {
// // //         refundId,
// // //         amount: refundEntity.amount / 100,
// // //         status: refundEntity.status,
// // //         speed: refundEntity.speed_requested || 'normal',
// // //         reason: refundEntity.notes?.reason || 'Refund initiated',
// // //         createdAt: new Date(refundEntity.created_at * 1000),
// // //         estimatedSettlement,
// // //         notes: `Refund initiated via webhook. Expected settlement in ${estimatedDays} business days.`
// // //       };
// // //       break;

// // //     case 'refund.processed':
// // //       if (order.refundInfo) {
// // //         order.refundInfo.status = refundEntity.status;
// // //         order.refundInfo.processedAt = new Date(refundEntity.processed_at * 1000);
// // //         order.refundInfo.speed = refundEntity.speed_processed;
// // //         order.refundInfo.notes = `Refund processed successfully. Amount should be credited within ${estimatedDays} business days.`;
// // //       }
// // //       // Update order status to reflect refund
// // //       order.status = 'Refunded';
// // //       break;

// // //     case 'refund.speed_changed':
// // //       if (order.refundInfo) {
// // //         order.refundInfo.speed = refundEntity.speed_processed;
// // //         const newEstimatedDays = refundEntity.speed_processed === 'optimum' ? 5 : 7;
// // //         const newSettlement = new Date();
// // //         newSettlement.setDate(newSettlement.getDate() + newEstimatedDays);
// // //         order.refundInfo.estimatedSettlement = newSettlement;
// // //         order.refundInfo.notes = `Refund speed updated to ${refundEntity.speed_processed}. Expected settlement in ${newEstimatedDays} business days.`;
// // //       }
// // //       break;
// // //   }

// // //   await order.save();

// // //   logger.info('Refund webhook processed successfully', { 
// // //     orderId: order._id, 
// // //     refundId,
// // //     refundStatus: refundEntity.status 
// // //   });
// // // }

// // // // Health check endpoint for webhook
// // // router.get('/webhook/health', (req, res) => {
// // //   res.status(200).json({ 
// // //     status: 'OK', 
// // //     service: 'Razorpay Webhook Handler',
// // //     timestamp: new Date().toISOString()
// // //   });
// // // });

// // // // Test webhook endpoint (for development only)
// // // if (process.env.NODE_ENV === 'development') {
// // //   router.post('/webhook/test', express.json(), async (req, res) => {
// // //     const { event, orderId, refundData } = req.body;

// // //     try {
// // //       if (event === 'refund.processed') {
// // //         const order = await Order.findById(orderId);
// // //         if (order && order.refundInfo) {
// // //           order.refundInfo.status = 'processed';
// // //           order.refundInfo.processedAt = new Date();
// // //           order.status = 'Refunded';
// // //           await order.save();
// // //         }
// // //       }

// // //       res.status(200).json({ message: 'Test webhook processed' });
// // //     } catch (error) {
// // //       res.status(500).json({ error: error.message });
// // //     }
// // //   });
// // // }

// // // module.exports = router;


// // // // 2:
// // const express = require('express');
// // const router = express.Router();
// // const crypto = require('crypto');
// // const Order = require('../models/order');
// // const { logger } = require('../utils/logger');

// // const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// // // Middleware to log all webhook requests for debugging
// // router.use('/webhook', (req, res, next) => {
// //   logger.info('Webhook request received', {
// //     headers: req.headers,
// //     method: req.method,
// //     url: req.url,
// //     timestamp: new Date().toISOString()
// //   });
// //   next();
// // });

// // router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
// //   try {
// //     const webhookSignature = req.headers['x-razorpay-signature'];

// //     if (!webhookSignature) {
// //       logger.error('Missing webhook signature');
// //       return res.status(400).send('Missing signature header');
// //     }

// //     if (!RAZORPAY_WEBHOOK_SECRET) {
// //       logger.error('Webhook secret not configured');
// //       return res.status(500).send('Webhook secret not configured');
// //     }

// //     // Verify webhook signature
// //     const expectedSignature = crypto
// //       .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
// //       .update(req.body, 'utf-8')
// //       .digest('hex');

// //     if (expectedSignature !== webhookSignature) {
// //       logger.error('Invalid webhook signature', {
// //         expected: expectedSignature,
// //         received: webhookSignature,
// //         bodyLength: req.body.length
// //       });
// //       return res.status(400).send('Invalid signature');
// //     }

// //     let payload;
// //     try {
// //       payload = JSON.parse(req.body.toString());
// //     } catch (parseError) {
// //       logger.error('Invalid JSON in webhook payload', { error: parseError.message });
// //       return res.status(400).send('Invalid JSON payload');
// //     }

// //     const { event, payload: eventData } = payload;

// //     logger.info('Valid webhook received', { 
// //       event, 
// //       entityId: eventData.payment?.entity?.id || eventData.order?.entity?.id || eventData.refund?.entity?.id,
// //       timestamp: new Date().toISOString()
// //     });

// //     // Handle different types of webhook events
// //     let processed = false;

// //     // Handle Payment Events
// //     if (['payment.captured', 'payment.failed', 'payment.authorized', 'payment.created'].includes(event)) {
// //       await handlePaymentWebhook(event, eventData);
// //       processed = true;
// //     }

// //     // Handle Order Events
// //     if (['order.paid'].includes(event)) {
// //       await handleOrderWebhook(event, eventData);
// //       processed = true;
// //     }

// //     // Handle Refund Events
// //     if (['refund.created', 'refund.processed', 'refund.failed', 'refund.speed_changed'].includes(event)) {
// //       await handleRefundWebhook(event, eventData);
// //       processed = true;
// //     }

// //     // Handle Settlement Events (for tracking when money reaches merchant account)
// //     if (['settlement.processed'].includes(event)) {
// //       await handleSettlementWebhook(event, eventData);
// //       processed = true;
// //     }

// //     if (!processed) {
// //       logger.warn('Unhandled webhook event type', { event });
// //     }

// //     res.status(200).json({ 
// //       success: true, 
// //       message: 'Webhook processed successfully',
// //       event,
// //       processed
// //     });

// //   } catch (error) {
// //     logger.error('Critical webhook processing error', { 
// //       error: error.message, 
// //       stack: error.stack,
// //       timestamp: new Date().toISOString()
// //     });
// //     res.status(500).send('Internal server error');
// //   }
// // });

// // async function handlePaymentWebhook(event, eventData) {
// //   const paymentEntity = eventData.payment.entity;
// //   const paymentId = paymentEntity.id;
// //   const orderId = paymentEntity.order_id;

// //   logger.info('Processing payment webhook', { event, paymentId, orderId });

// //   try {
// //     // Find order by razorpayOrderId
// //     const order = await Order.findOne({ razorpayOrderId: orderId });

// //     if (!order) {
// //       logger.warn('Order not found for payment webhook', { orderId, paymentId });
// //       return;
// //     }

// //     // Update payment info based on event
// //     let paymentStatus = '';
// //     switch (event) {
// //       case 'payment.created':
// //         // paymentStatus = 'created';
// //         paymentStatus = 'paid';
// //         break;
// //       case 'payment.captured':
// //         paymentStatus = 'captured';
// //         break;
// //       case 'payment.failed':
// //         paymentStatus = 'failed';
// //         break;
// //       case 'payment.authorized':
// //         paymentStatus = 'authorized';
// //         break;
// //       default:
// //         paymentStatus = paymentEntity.status || 'unknown';
// //     }

// //     // Always update payment info with the latest data
// //     order.paymentInfo = {
// //       paymentId,
// //       amount: paymentEntity.amount / 100, // Convert from paise to rupees
// //       status: paymentStatus,
// //       method: paymentEntity.method || 'unknown',
// //       updatedAt: new Date(),
// //       razorpayCreatedAt: paymentEntity.created_at ? new Date(paymentEntity.created_at * 1000) : null,
// //       // Store additional payment details for debugging
// //       fee: paymentEntity.fee ? paymentEntity.fee / 100 : 0,
// //       tax: paymentEntity.tax ? paymentEntity.tax / 100 : 0,
// //       acquirerData: paymentEntity.acquirer_data || {}
// //     };

// //     // Update order status based on payment status
// //     switch (event) {
// //       case 'payment.failed':
// //         order.status = 'Cancelled';
// //         order.cancelReason = `Payment failed: ${paymentEntity.error_description || 'Unknown error'}`;
// //         order.cancelledBy = 'system';
// //         order.cancelledAt = new Date();
// //         break;

// //       case 'payment.captured':
// //         // Payment successful - keep order as Pending for admin to process
// //         if (order.status === 'Cancelled') {
// //           // If order was previously cancelled due to payment failure, reactivate it
// //           order.status = 'Pending';
// //           order.cancelReason = null;
// //           order.cancelledBy = null;
// //           order.cancelledAt = null;
// //         }
// //         break;

// //       case 'payment.authorized':
// //         // Payment authorized but not captured yet
// //         if (order.status === 'Cancelled') {
// //           order.status = 'Pending'; // Reactivate if was cancelled
// //         }
// //         break;
// //     }

// //     await order.save();

// //     logger.info('Payment webhook processed successfully', { 
// //       orderId: order._id, 
// //       paymentStatus,
// //       paymentId,
// //       orderStatus: order.status
// //     });

// //   } catch (error) {
// //     logger.error('Error processing payment webhook', {
// //       error: error.message,
// //       stack: error.stack,
// //       paymentId,
// //       orderId
// //     });
// //     throw error; // Re-throw to trigger webhook retry
// //   }
// // }

// // async function handleOrderWebhook(event, eventData) {
// //   const orderEntity = eventData.order.entity;
// //   const razorpayOrderId = orderEntity.id;

// //   logger.info('Processing order webhook', { event, razorpayOrderId });

// //   try {
// //     // Find order by razorpayOrderId
// //     const order = await Order.findOne({ razorpayOrderId });

// //     if (!order) {
// //       logger.warn('Order not found for order webhook', { razorpayOrderId });
// //       return;
// //     }

// //     // Update order status based on order event
// //     switch (event) {
// //       case 'order.paid':
// //         // Order is fully paid - keep status as Pending until admin marks as Delivered
// //         if (order.status === 'Pending') {
// //           logger.info('Order payment completed', { orderId: order._id });
// //           // Could add a flag to indicate payment is complete
// //           order.paymentCompleted = true;
// //           order.paymentCompletedAt = new Date();
// //         }
// //         break;
// //     }

// //     await order.save();

// //     logger.info('Order webhook processed successfully', { 
// //       orderId: order._id, 
// //       event,
// //       orderStatus: order.status
// //     });

// //   } catch (error) {
// //     logger.error('Error processing order webhook', {
// //       error: error.message,
// //       stack: error.stack,
// //       razorpayOrderId
// //     });
// //     throw error;
// //   }
// // }

// // async function handleRefundWebhook(event, eventData) {
// //   const refundEntity = eventData.refund.entity;
// //   const refundId = refundEntity.id;
// //   const paymentId = refundEntity.payment_id;

// //   logger.info('Processing refund webhook', { event, refundId, paymentId });

// //   try {
// //     // Find order by payment ID
// //     const order = await Order.findOne({ 'paymentInfo.paymentId': paymentId });

// //     if (!order) {
// //       logger.warn('Order not found for refund webhook', { paymentId, refundId });
// //       return;
// //     }

// //     // Calculate estimated settlement date based on refund speed
// //     const refundSpeed = refundEntity.speed_processed || refundEntity.speed_requested || 'normal';
// //     const estimatedDays = refundSpeed === 'optimum' ? 5 : 7;
// //     const estimatedSettlement = new Date();
// //     estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

// //     // Update refund info based on event
// //     switch (event) {
// //       case 'refund.created':
// //         order.refundInfo = {
// //           refundId,
// //           amount: refundEntity.amount / 100,
// //           status: refundEntity.status || 'created',
// //           speed: refundSpeed,
// //           reason: refundEntity.notes?.reason || order.refundInfo?.reason || 'Refund initiated',
// //           createdAt: new Date(refundEntity.created_at * 1000),
// //           estimatedSettlement,
// //           notes: `Refund initiated via webhook. Expected settlement in ${estimatedDays} business days.`,
// //           // Additional tracking fields
// //           batchId: refundEntity.batch_id || null,
// //           receiptNumber: refundEntity.receipt || null
// //         };

// //         // Update order status to indicate refund is in progress
// //         if (order.status !== 'Cancelled') {
// //           order.status = 'Cancelled';
// //           order.cancelReason = order.cancelReason || 'Refund initiated';
// //           order.cancelledBy = order.cancelledBy || 'system';
// //           order.cancelledAt = order.cancelledAt || new Date();
// //         }
// //         break;

// //       case 'refund.processed':
// //         if (order.refundInfo && order.refundInfo.refundId === refundId) {
// //           order.refundInfo.status = refundEntity.status || 'processed';
// //           order.refundInfo.processedAt = new Date(refundEntity.processed_at * 1000);
// //           order.refundInfo.speed = refundEntity.speed_processed || order.refundInfo.speed;
// //           order.refundInfo.notes = `Refund processed successfully. Amount should be credited within ${estimatedDays} business days.`;

// //           // Update order status to reflect successful refund
// //           order.status = 'Refunded';
// //         } else {
// //           logger.warn('Refund processed webhook for unknown refund', { refundId, orderId: order._id });
// //         }
// //         break;

// //       case 'refund.failed':
// //         if (order.refundInfo && order.refundInfo.refundId === refundId) {
// //           order.refundInfo.status = 'failed';
// //           order.refundInfo.failedAt = new Date();
// //           order.refundInfo.notes = `Refund failed: ${refundEntity.error_description || 'Unknown error'}`;
// //           order.refundInfo.errorCode = refundEntity.error_code || null;
// //           order.refundInfo.errorDescription = refundEntity.error_description || null;

// //           // Keep order as cancelled but indicate refund failed
// //           order.status = 'Cancelled';
// //         }
// //         break;

// //       case 'refund.speed_changed':
// //         if (order.refundInfo && order.refundInfo.refundId === refundId) {
// //           const newSpeed = refundEntity.speed_processed || refundEntity.speed_requested;
// //           const newEstimatedDays = newSpeed === 'optimum' ? 5 : 7;
// //           const newSettlement = new Date();
// //           newSettlement.setDate(newSettlement.getDate() + newEstimatedDays);

// //           order.refundInfo.speed = newSpeed;
// //           order.refundInfo.estimatedSettlement = newSettlement;
// //           order.refundInfo.notes = `Refund speed updated to ${newSpeed}. Expected settlement in ${newEstimatedDays} business days.`;
// //         }
// //         break;
// //     }

// //     await order.save();

// //     logger.info('Refund webhook processed successfully', { 
// //       orderId: order._id, 
// //       refundId,
// //       refundStatus: order.refundInfo?.status,
// //       orderStatus: order.status
// //     });

// //   } catch (error) {
// //     logger.error('Error processing refund webhook', {
// //       error: error.message,
// //       stack: error.stack,
// //       refundId,
// //       paymentId
// //     });
// //     throw error;
// //   }
// // }

// // async function handleSettlementWebhook(event, eventData) {
// //   const settlementEntity = eventData.settlement.entity;
// //   const settlementId = settlementEntity.id;

// //   logger.info('Processing settlement webhook', { event, settlementId });

// //   try {
// //     // Settlement webhooks contain information about when money reaches merchant account
// //     // This can be useful for tracking but doesn't usually require order updates

// //     // Log settlement for tracking purposes
// //     logger.info('Settlement processed', {
// //       settlementId,
// //       amount: settlementEntity.amount / 100,
// //       fees: settlementEntity.fees / 100,
// //       tax: settlementEntity.tax / 100,
// //       utr: settlementEntity.utr,
// //       createdAt: new Date(settlementEntity.created_at * 1000)
// //     });

// //     // You could update orders to track settlement if needed
// //     // For now, just log the event

// //   } catch (error) {
// //     logger.error('Error processing settlement webhook', {
// //       error: error.message,
// //       settlementId
// //     });
// //     throw error;
// //   }
// // }

// // // Health check endpoint for webhook
// // router.get('/webhook/health', (req, res) => {
// //   res.status(200).json({ 
// //     status: 'OK', 
// //     service: 'Razorpay Webhook Handler',
// //     timestamp: new Date().toISOString(),
// //     webhookSecret: RAZORPAY_WEBHOOK_SECRET ? 'configured' : 'missing'
// //   });
// // });

// // // Test webhook endpoint (for development only)
// // if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
// //   router.post('/webhook/test', express.json(), async (req, res) => {
// //     const { event, orderId, refundData, paymentData } = req.body;

// //     try {
// //       logger.info('Processing test webhook', { event, orderId });

// //       const order = await Order.findById(orderId);
// //       if (!order) {
// //         return res.status(404).json({ error: 'Order not found' });
// //       }

// //       switch (event) {
// //         case 'payment.captured':
// //           order.paymentInfo = {
// //             ...order.paymentInfo,
// //             status: 'captured',
// //             updatedAt: new Date(),
// //             ...paymentData
// //           };
// //           break;

// //         case 'refund.processed':
// //           if (order.refundInfo) {
// //             order.refundInfo.status = 'processed';
// //             order.refundInfo.processedAt = new Date();
// //             order.status = 'Refunded';
// //             if (refundData) {
// //               Object.assign(order.refundInfo, refundData);
// //             }
// //           }
// //           break;

// //         case 'payment.failed':
// //           order.paymentInfo = {
// //             ...order.paymentInfo,
// //             status: 'failed',
// //             updatedAt: new Date()
// //           };
// //           order.status = 'Cancelled';
// //           order.cancelReason = 'Payment failed (test)';
// //           break;
// //       }

// //       await order.save();

// //       res.status(200).json({ 
// //         message: 'Test webhook processed', 
// //         orderId: order._id,
// //         orderStatus: order.status,
// //         paymentStatus: order.paymentInfo?.status
// //       });
// //     } catch (error) {
// //       logger.error('Test webhook error', { error: error.message });
// //       res.status(500).json({ error: error.message });
// //     }
// //   });
// // }

// // // Webhook status and stats endpoint
// // router.get('/webhook/stats', async (req, res) => {
// //   try {
// //     // Get some basic stats about orders and payments
// //     const totalOrders = await Order.countDocuments();
// //     const capturedPayments = await Order.countDocuments({ 'paymentInfo.status': 'captured' });
// //     const failedPayments = await Order.countDocuments({ 'paymentInfo.status': 'failed' });
// //     const refundedOrders = await Order.countDocuments({ status: 'Refunded' });
// //     const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

// //     res.status(200).json({
// //       totalOrders,
// //       paymentStats: {
// //         captured: capturedPayments,
// //         failed: failedPayments,
// //         successRate: totalOrders > 0 ? ((capturedPayments / totalOrders) * 100).toFixed(2) + '%' : '0%'
// //       },
// //       orderStats: {
// //         refunded: refundedOrders,
// //         cancelled: cancelledOrders
// //       },
// //       timestamp: new Date().toISOString()
// //     });
// //   } catch (error) {
// //     logger.error('Error fetching webhook stats', { error: error.message });
// //     res.status(500).json({ error: 'Failed to fetch stats' });
// //   }
// // });

// // module.exports = router;


// // final:
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/order');
const { logger } = require('../utils/logger');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Main webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log("=== RAZORPAY WEBHOOK RECEIVED ===");

  try {
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (!webhookSignature) {
      console.log("Missing webhook signature");
      return res.status(400).send('Missing signature header');
    }

    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.log("Webhook secret not configured");
      return res.status(500).send('Webhook secret not configured');
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(req.body, 'utf-8')
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.log("Invalid webhook signature");
      return res.status(400).send('Invalid signature');
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(req.body.toString());
    } catch (parseError) {
      console.log("Invalid JSON in webhook payload");
      return res.status(400).send('Invalid JSON payload');
    }

    const { event, payload: eventData } = payload;
    console.log("Webhook event received:", event);

    // Handle different events
    let processed = false;
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(eventData);
        processed = true;
        break;
      case 'payment.failed':
        await handlePaymentFailed(eventData);
        processed = true;
        break;
      case 'payment.authorized':
        await handlePaymentAuthorized(eventData);
        processed = true;
        break;
      case 'refund.created':
        await handleRefundCreated(eventData);
        processed = true;
        break;
      case 'refund.processed':
        await handleRefundProcessed(eventData);
        processed = true;
        break;
      case 'refund.failed':
        await handleRefundFailed(eventData);
        processed = true;
        break;
      default:
        console.log("Unhandled webhook event:", event);
        processed = false;
    }

    logger.info('Webhook processed', { event, processed });

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      event,
      processed
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    logger.error('Critical webhook processing error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).send('Internal server error');
  }
});

// Handle payment captured
async function handlePaymentCaptured(eventData) {
  const paymentEntity = eventData.payment.entity;
  const orderId = paymentEntity.order_id;

  console.log("Processing payment.captured for order:", orderId);

  try {
    const order = await Order.findOne({ razorpayOrderId: orderId });

    if (!order) {
      console.log("Order not found for payment:", orderId);
      logger.warn('Order not found for payment.captured', { orderId });
      return;
    }

    // Update payment info with complete details
    order.paymentInfo = {
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount / 100,
      status: 'captured',
      method: paymentEntity.method || 'unknown',
      capturedAt: paymentEntity.captured_at ? new Date(paymentEntity.captured_at * 1000) : new Date(),
      updatedAt: new Date()
    };

    // Reactivate order if it was cancelled due to payment issues
    if (order.status === 'Cancelled' && order.cancelledBy === 'system') {
      order.status = 'Pending';
      order.cancelReason = null;
      order.cancelledBy = null;
      order.cancelledAt = null;
    }

    await order.save();

    console.log("Payment captured processed successfully for order:", order._id);
    logger.info('Payment captured processed', {
      orderId: order._id,
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount / 100,
      userEmail: order.userEmail
    });

  } catch (error) {
    console.error("Error processing payment.captured:", error);
    logger.error('Error processing payment.captured', {
      orderId,
      error: error.message
    });
    throw error;
  }
}

// Handle payment failed
async function handlePaymentFailed(eventData) {
  const paymentEntity = eventData.payment.entity;
  const orderId = paymentEntity.order_id;

  console.log("Processing payment.failed for order:", orderId);

  try {
    const order = await Order.findOne({ razorpayOrderId: orderId });

    if (!order) {
      console.log("Order not found for failed payment:", orderId);
      return;
    }

    // Update payment info
    order.paymentInfo = {
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount / 100,
      status: 'failed',
      method: paymentEntity.method || 'unknown',
      failedAt: new Date(),
      updatedAt: new Date()
    };

    // Cancel order due to payment failure
    order.status = 'Cancelled';
    order.cancelReason = `Payment failed: ${paymentEntity.error_description || 'Payment gateway error'}`;
    order.cancelledBy = 'system';
    order.cancelledAt = new Date();

    await order.save();

    console.log("Payment failed processed successfully for order:", order._id);
    logger.info('Payment failed processed', {
      orderId: order._id,
      paymentId: paymentEntity.id,
      reason: paymentEntity.error_description
    });

  } catch (error) {
    console.error("Error processing payment.failed:", error);
    throw error;
  }
}

// Handle payment authorized
async function handlePaymentAuthorized(eventData) {
  const paymentEntity = eventData.payment.entity;
  const orderId = paymentEntity.order_id;

  console.log("Processing payment.authorized for order:", orderId);

  try {
    const order = await Order.findOne({ razorpayOrderId: orderId });

    if (!order) {
      console.log("Order not found for authorized payment:", orderId);
      return;
    }

    // Update payment info
    order.paymentInfo = {
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount / 100,
      status: 'authorized',
      method: paymentEntity.method || 'unknown',
      updatedAt: new Date()
    };

    // Reactivate order if cancelled
    if (order.status === 'Cancelled' && order.cancelledBy === 'system') {
      order.status = 'Pending';
      order.cancelReason = null;
      order.cancelledBy = null;
      order.cancelledAt = null;
    }

    await order.save();

    console.log("Payment authorized processed successfully for order:", order._id);

  } catch (error) {
    console.error("Error processing payment.authorized:", error);
    throw error;
  }
}

// Handle refund created
async function handleRefundCreated(eventData) {
  const refundEntity = eventData.refund.entity;
  const paymentId = refundEntity.payment_id;

  console.log("Processing refund.created for payment:", paymentId);

  try {
    const order = await Order.findOne({ 'paymentInfo.paymentId': paymentId });

    if (!order) {
      console.log("Order not found for refund:", paymentId);
      return;
    }

    // Calculate estimated settlement date
    const refundSpeed = refundEntity.speed_processed || refundEntity.speed_requested || 'optimum';
    const estimatedDays = refundSpeed === 'optimum' ? 5 : 7;
    const estimatedSettlement = new Date(refundEntity.created_at * 1000);
    estimatedSettlement.setDate(estimatedSettlement.getDate() + estimatedDays);

    // Update refund info
    order.refundInfo = {
      refundId: refundEntity.id,
      amount: refundEntity.amount / 100,
      status: 'initiated',
      reason: refundEntity.notes?.reason || order.cancelReason || 'Refund initiated',
      initiatedAt: new Date(refundEntity.created_at * 1000),
      estimatedSettlement: estimatedSettlement,
      speed: refundSpeed
    };

    // Update order status
    if (order.status !== 'Cancelled') {
      order.status = 'Cancelled';
      order.cancelReason = order.cancelReason || 'Refund initiated';
      order.cancelledBy = order.cancelledBy || 'system';
      order.cancelledAt = order.cancelledAt || new Date();
    }

    await order.save();

    console.log("Refund created processed successfully for order:", order._id);
    logger.info('Refund created processed', {
      orderId: order._id,
      refundId: refundEntity.id,
      amount: refundEntity.amount / 100,
      estimatedSettlement: estimatedSettlement
    });

  } catch (error) {
    console.error("Error processing refund.created:", error);
    throw error;
  }
}

// Handle refund processed
async function handleRefundProcessed(eventData) {
  const refundEntity = eventData.refund.entity;
  const paymentId = refundEntity.payment_id;

  console.log("Processing refund.processed for payment:", paymentId);

  try {
    const order = await Order.findOne({ 'paymentInfo.paymentId': paymentId });

    if (!order) {
      console.log("Order not found for processed refund:", paymentId);
      return;
    }

    // Update refund info with processed status
    if (order.refundInfo && order.refundInfo.refundId === refundEntity.id) {
      order.refundInfo.status = 'processed';
      order.refundInfo.processedAt = new Date(refundEntity.processed_at * 1000);
      order.refundInfo.speed = refundEntity.speed_processed || order.refundInfo.speed;

      // Update order status to Refunded
      order.status = 'Refunded';
    } else {
      // If no existing refund info, create it
      const estimatedSettlement = new Date(refundEntity.processed_at * 1000);

      order.refundInfo = {
        refundId: refundEntity.id,
        amount: refundEntity.amount / 100,
        status: 'processed',
        reason: 'Refund processed',
        processedAt: new Date(refundEntity.processed_at * 1000),
        estimatedSettlement: estimatedSettlement,
        speed: refundEntity.speed_processed || 'optimum'
      };

      order.status = 'Refunded';
    }

    await order.save();

    console.log("Refund processed successfully for order:", order._id);
    logger.info('Refund processed', {
      orderId: order._id,
      refundId: refundEntity.id,
      amount: refundEntity.amount / 100,
      processedAt: refundEntity.processed_at
    });

  } catch (error) {
    console.error("Error processing refund.processed:", error);
    throw error;
  }
}

// Handle refund failed
async function handleRefundFailed(eventData) {
  const refundEntity = eventData.refund.entity;
  const paymentId = refundEntity.payment_id;

  console.log("Processing refund.failed for payment:", paymentId);

  try {
    const order = await Order.findOne({ 'paymentInfo.paymentId': paymentId });

    if (!order) {
      console.log("Order not found for failed refund:", paymentId);
      return;
    }

    // Update refund info with failure details
    if (order.refundInfo && order.refundInfo.refundId === refundEntity.id) {
      order.refundInfo.status = 'failed';
      order.refundInfo.failedAt = new Date();
      order.refundInfo.reason = `Refund failed: ${refundEntity.error_description || 'Unknown error'}`;
    } else {
      order.refundInfo = {
        refundId: refundEntity.id,
        amount: refundEntity.amount / 100,
        status: 'failed',
        reason: `Refund failed: ${refundEntity.error_description || 'Unknown error'}`,
        failedAt: new Date()
      };
    }

    // Keep order as cancelled but indicate refund failed
    order.status = 'Cancelled';

    await order.save();

    console.log("Refund failed processed for order:", order._id);
    logger.error('Refund failed', {
      orderId: order._id,
      refundId: refundEntity.id,
      error: refundEntity.error_description
    });

  } catch (error) {
    console.error("Error processing refund.failed:", error);
    throw error;
  }
}

// Health check endpoint
router.get('/webhook/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Razorpay Webhook Handler',
    timestamp: new Date().toISOString(),
    webhookSecret: RAZORPAY_WEBHOOK_SECRET ? 'configured' : 'missing'
  });
});

module.exports = router;

