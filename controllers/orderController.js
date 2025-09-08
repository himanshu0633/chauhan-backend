// const Order = require('../models/order');
// const { logger } = require("../utils/logger");

// // Create a new order
// exports.createOrder = async (req, res) => {
//   const { userId, items, address, phone, totalAmount, paymentId } = req.body;
//   logger.info("Received createOrder request", { userId, itemCount: items?.length, totalAmount });

//   if (!userId || !items?.length || !address || !phone || !totalAmount) {
//     logger.warn("Missing required fields in createOrder request", { body: req.body });
//     return res.status(400).json({ message: "Missing required fields" });
//   }
//   try {
//     const newOrder = new Order({ userId, items, address, phone, totalAmount, paymentId });
//     await newOrder.save();
//     logger.info("Order created successfully", { orderId: newOrder._id, userId });
//     res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
//   } catch (error) {
//     logger.error("Error placing order", { error: error.message, stack: error.stack });
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get all orders for a specific user
// exports.getOrdersByUser = async (req, res) => {
//   const { userId } = req.params;
//   logger.info("Received getOrders request", { userId });

//   try {
//     const orders = await Order.find({ userId }).sort({ createdAt: -1 });
//     logger.info("Fetched orders for user", { userId, orderCount: orders.length });
//     res.status(200).json({
//       orders,
//       totalCount: orders.length
//     });
//   } catch (error) {
//     logger.error("Error fetching orders", { error: error.message, stack: error.stack });
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get all orders (admin)
// exports.getAllOrders = async (req, res) => {
//   logger.info("Received request to fetch all orders");
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     logger.info("Fetched all orders", { totalOrders: orders.length });
//     res.status(200).json({ orders });
//   } catch (error) {
//     logger.error("Error fetching all orders", { error: error.message, stack: error.stack });
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get total number of orders
// exports.getTotalOrderCount = async (req, res) => {
//   logger.info("Received request to get total order count");
//   try {
//     const count = await Order.countDocuments();
//     logger.info("Fetched total order count", { count });
//     res.status(200).json({ totalOrders: count });
//   } catch (error) {
//     logger.error("Error getting order count", { error: error.message, stack: error.stack });
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Health check for the controller
// exports.healthCheck = (req, res) => {
//   res.send("API Working");
// };
